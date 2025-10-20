/**
 * Validation utilities for Global Cargo Shipping Management System
 * Contains common business rules and validation functions
 */

// ✅ Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ✅ Validate phone number format (international)
export const isValidPhoneNumber = (phone) => {
  const phoneRegex = /^\+?[\d\s-()]{7,15}$/;
  return phoneRegex.test(phone);
};

// ✅ Validate coordinates format (lat,lng)
export const isValidCoordinates = (coords) => {
  const regex = /^-?\d{1,3}(\.\d+)?,-?\d{1,3}(\.\d+)?$/;
  if (!regex.test(coords)) return false;
  
  const [lat, lng] = coords.split(',').map(parseFloat);
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

// ✅ Validate positive number
export const isPositiveNumber = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
};

// ✅ Validate future date
export const isFutureDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  return date > now;
};

// ✅ Validate date format
export const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

// ✅ Validate enum values
export const isValidEnum = (value, allowedValues) => {
  return allowedValues.includes(value);
};

// ✅ Sanitize string input
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/[<>]/g, '');
};

// ✅ Validate string length
export const isValidStringLength = (str, minLength = 1, maxLength = 255) => {
  if (typeof str !== 'string') return false;
  return str.trim().length >= minLength && str.trim().length <= maxLength;
};

// ✅ Business rule: Validate ship capacity vs cargo weight
export const validateShipCapacity = (shipCapacity, cargoWeight) => {
  const capacity = parseFloat(shipCapacity);
  const weight = parseFloat(cargoWeight);
  
  if (isNaN(capacity) || isNaN(weight)) {
    return { valid: false, message: 'Invalid capacity or weight values' };
  }
  
  if (weight > capacity) {
    return { 
      valid: false, 
      message: `Cargo weight (${weight}T) exceeds ship capacity (${capacity}T)` 
    };
  }
  
  // Warn if using >90% of capacity
  if (weight > capacity * 0.9) {
    return { 
      valid: true, 
      warning: `High capacity usage: ${Math.round((weight/capacity)*100)}%` 
    };
  }
  
  return { valid: true };
};

// ✅ Business rule: Validate shipment workflow transitions
export const validateStatusTransition = (currentStatus, newStatus) => {
  const allowedTransitions = {
    'pending': ['in_transit', 'cancelled'],
    'in_transit': ['delivered', 'delayed', 'cancelled'],
    'delayed': ['delivered', 'cancelled', 'in_transit'],
    'delivered': [], // Final state
    'cancelled': [] // Final state
  };
  
  if (!allowedTransitions[currentStatus]) {
    return { valid: false, message: `Invalid current status: ${currentStatus}` };
  }
  
  if (!allowedTransitions[currentStatus].includes(newStatus)) {
    return { 
      valid: false, 
      message: `Cannot transition from ${currentStatus} to ${newStatus}` 
    };
  }
  
  return { valid: true };
};

// ✅ Business rule: Validate departure before arrival
export const validateDepartureThenArrival = (departureDate, arrivalDate) => {
  const departure = new Date(departureDate);
  const arrival = new Date(arrivalDate);
  
  if (arrival <= departure) {
    return { 
      valid: false, 
      message: 'Arrival date must be after departure date' 
    };
  }
  
  return { valid: true };
};

// ✅ Business rule: Validate crew role assignments
export const validateCrewRole = (role, shipId, existingCaptain = null) => {
  if (role === 'Captain' && shipId) {
    if (existingCaptain) {
      return { 
        valid: false, 
        message: 'This ship already has an active Captain' 
      };
    }
  }
  
  return { valid: true };
};

// ✅ Validate required fields
export const validateRequiredFields = (obj, requiredFields) => {
  const missing = [];
  
  for (const field of requiredFields) {
    if (!obj[field] || (typeof obj[field] === 'string' && obj[field].trim() === '')) {
      missing.push(field);
    }
  }
  
  if (missing.length > 0) {
    return { 
      valid: false, 
      message: `Missing required fields: ${missing.join(', ')}` 
    };
  }
  
  return { valid: true };
};

// ✅ Create validation middleware
export const createValidationMiddleware = (validationRules) => {
  return (req, res, next) => {
    const errors = [];
    
    for (const rule of validationRules) {
      const result = rule(req.body, req.params, req.query);
      if (!result.valid) {
        errors.push(result.message);
      }
    }
    
    if (errors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors 
      });
    }
    
    next();
  };
};

// ✅ Common validation rule factories
export const createRequiredFieldsRule = (fields) => {
  return (body) => validateRequiredFields(body, fields);
};

export const createEmailRule = (field) => {
  return (body) => {
    if (body[field] && !isValidEmail(body[field])) {
      return { valid: false, message: `Invalid email format for ${field}` };
    }
    return { valid: true };
  };
};

export const createPhoneRule = (field) => {
  return (body) => {
    if (body[field] && !isValidPhoneNumber(body[field])) {
      return { valid: false, message: `Invalid phone format for ${field}` };
    }
    return { valid: true };
  };
};

export const createPositiveNumberRule = (field) => {
  return (body) => {
    if (body[field] && !isPositiveNumber(body[field])) {
      return { valid: false, message: `${field} must be a positive number` };
    }
    return { valid: true };
  };
};