# Global Cargo Shipping Management System
## Internship Project No. 3
**Date**: 15-JULY-2025  
**Program**: ICTA Internship Program

---

## System Description

The **Global Cargo Shipping Management System** is a comprehensive maritime logistics management platform designed to facilitate, track, and optimize the shipping of cargo across continents via registered vessels. The system brings together multiple components of maritime cargo logistics—clients, cargo, ships, crew, and shipments—into a single, integrated solution that enhances operational efficiency, improves visibility, and supports business scalability.

## Core System Features

### A. Ship Registration and Tracking
- Register ships with details like name, type, registration number, and cargo capacity
- Track the current ship location by port or coordinates
- Assign ship statuses: Active, Under Maintenance, or Decommissioned

### B. Crew Management
- Add and manage crew members with role, nationality, and contact details
- Assign each crew member to a ship and use is_active to manage active/inactive crew

### C. Client Management
- Register client companies with contact person, email, phone, and address
- View cargo owned by each client and enable/disable clients using the is_active flag

### D. Cargo Management
- Create and manage cargo records with description, weight, volume, and type
- Link cargo to its respective client and track whether the cargo is active or archived

### E. Shipment Management
- Schedule cargo shipments by selecting ship, cargo, origin port, and destination port
- Record departure, estimated arrival, and actual arrival dates
- Set and track shipment status: Pending, In Transit, Delivered, or Delayed
- Manage shipment lifecycle using the is_active flag

---

## Database Schema

The system uses PostgreSQL database with the following schema structure:

### CLIENTS TABLE
```sql
CREATE TABLE clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(150) NOT NULL,
    last_name VARCHAR(150) NOT NULL,
    email_address VARCHAR(150),
    phone_number VARCHAR(50),
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### SHIPS TABLE
```sql
CREATE TABLE ships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(200) UNIQUE NOT NULL,
    capacity_in_tonnes DECIMAL(10, 2), -- maximum weight the ship can carry
    type ENUM('cargo ship', 'passenger ship', 'military ship', 'icebreaker', 'fishing vessel', 'barge ship') DEFAULT 'cargo ship',
    status ENUM('active', 'under maintenance', 'decommissioned') DEFAULT 'active',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### CREW TABLE
```sql
CREATE TABLE crew (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ship_id INT,
    first_name VARCHAR(150) NOT NULL,
    last_name VARCHAR(150) NOT NULL,
    role ENUM('Captain', 'Chief Officer', 'Able Seaman', 'Ordinary Seaman', 'Engine Cadet', 'Radio Officer', 'Chief Cook', 'Steward', 'Deckhand') DEFAULT 'Captain',
    phone_number VARCHAR(30) NOT NULL,
    nationality VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ship_id) REFERENCES ships(id) ON DELETE SET NULL
);
```

### PORTS TABLE
```sql
CREATE TABLE ports (
    id INT PRIMARY KEY AUTO_INCREMENT, -- Unique identifier for each port
    name VARCHAR(255) NOT NULL, -- Name of the port
    country VARCHAR(100) NOT NULL, -- Country where the port is located
    port_type VARCHAR(100), -- Type of port (Cargo, Passenger, etc.)
    coordinates VARCHAR(50), -- Latitude and longitude coordinates
    depth FLOAT, -- Depth of the harbor in meters
    docking_capacity INT, -- Number of available docking spaces or berths
    max_vessel_size FLOAT, -- Maximum vessel size in meters
    security_level VARCHAR(50), -- Security level (e.g., High, Medium, Low)
    customs_authorized BOOLEAN, -- Whether the port is authorized for customs clearance
    operational_hours VARCHAR(50), -- Operational hours of the port
    port_manager VARCHAR(255), -- Manager of the port
    port_contact_info VARCHAR(255), -- Contact information for the port
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### CARGO TABLE
```sql
CREATE TABLE cargo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    description TEXT,
    weight DECIMAL(10, 2), -- kg or tons
    volume DECIMAL(10, 2),
    client_id INT,
    cargo_type ENUM('perishable', 'dangerous', 'general', 'other') DEFAULT 'general',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
);
```

### SHIPMENTS TABLE
```sql
CREATE TABLE shipments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cargo_id INT,
    ship_id INT,
    origin_port_id INT, -- Placeholder for ports table
    destination_port_id INT, -- Placeholder for ports table
    departure_date DATE,
    arrival_estimate DATE,
    actual_arrival_date DATE,
    status ENUM('pending', 'in_transit', 'delivered', 'delayed') DEFAULT 'pending',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cargo_id) REFERENCES cargo(id) ON DELETE SET NULL,
    FOREIGN KEY (ship_id) REFERENCES ships(id) ON DELETE SET NULL,
    FOREIGN KEY (origin_port_id) REFERENCES ports(id) ON DELETE SET NULL,
    FOREIGN KEY (destination_port_id) REFERENCES ports(id) ON DELETE SET NULL
);
```

---

## User Stories

User stories help clearly define software requirements from the end-user's perspective, ensuring the product delivers real value. Below is a set of user stories organized by user roles and features.

### 1. Ship Management

**As an Admin, I want to:**

**Add a new ship** so that I can expand the company's fleet.
- **Acceptance Criteria**: Form with required fields (name, registration_number, capacity) and optional fields (type, status). Registration numbers must be unique.

**Edit an existing ship** so that I can correct details or update status.
- **Acceptance Criteria**: Changes to registration_number re-check uniqueness. Status updates (e.g., "under maintenance") trigger alerts to logistics team.

**View all ships** so that I can monitor fleet capacity.
- **Acceptance Criteria**: Paginated list with filters by type (cargo/passenger), status (active/maintenance), and sort by capacity.

**Decommission a ship** so that outdated vessels are removed from active service.
- **Acceptance Criteria**: Toggle `is_active` flag; decommissioned ships don't appear in shipment assignment dropdowns.

### 2. Crew Management

**As an Admin, I want to:**

**Add a new crew member** so that I can staff our ships.
- **Acceptance Criteria**: Form with required fields (first_name, last_name, role, phone_number) and optional field (nationality). Phone numbers must be unique.

**Edit a crew member's details** so that I can keep records up-to-date.
- **Acceptance Criteria**: Role changes trigger validation (e.g., only one Captain per ship). Phone number changes preserve uniqueness.

**View all crew members** so that I can manage staffing.
- **Acceptance Criteria**: Paginated list with filters by role, ship assignment, and status. Sort by last name or join date.

**Deactivate a crew member** so that former employees are removed from active duty.
- **Acceptance Criteria**: Toggle `is_active` flag; inactive crew don't appear in assignment lists but retain historical records.

### 3. Ports Management

**As an Admin, I want to:**

**Add a new port** so that we can expand shipping routes.
- **Acceptance Criteria**: Form with required fields (name, country, coordinates) and optional fields (docking_capacity, customs_authorized). Port names must be unique per country.

**Edit port details** so that information stays current.
- **Acceptance Criteria**: Coordinate changes validate proper lat/long format. Capacity updates warn if below largest ship's requirements.

**View all ports** so that I can plan logistics.
- **Acceptance Criteria**: Map and list views with filters by country, port_type, and customs status. Sort by name or docking capacity.

**Archive a port** so that inactive ports don't appear in new shipments.
- **Acceptance Criteria**: Toggle `is_active` flag; archived ports remain visible in historical shipment data.

### 4. Cargo Management

**As an Admin, I want to:**

**Register new cargo** so that items can be shipped.
- **Acceptance Criteria**: Form with required fields (description, weight, client_id) and optional fields (volume, cargo_type). Weight must be >0.

**Edit cargo details** so that records stay accurate.
- **Acceptance Criteria**: Cargo_type changes from 'dangerous' trigger safety protocol confirmations. Client changes preserve shipment history.

**View all cargo** so that I can track inventory.
- **Acceptance Criteria**: Filter by client, cargo_type, and status. Sort by weight or registration date. Dangerous cargo highlighted.

**Deactivate cargo records** so that shipped items don't clutter active lists.
- **Acceptance Criteria**: Toggle `is_active` flag; inactive cargo remains linked to completed shipments.

### 5. Shipments Management

**As an Admin, I want to:**

**Create a new shipment** so that cargo can be transported.
- **Acceptance Criteria**: Form with required fields (cargo_id, ship_id, origin/destination ports, departure_date). Validates ship capacity vs cargo weight.

**Update shipment status** so that progress is tracked.
- **Acceptance Criteria**: Status changes follow workflow rules (e.g., can't mark 'delivered' before departure). Delays require reason notes.

**View all shipments** so that I can monitor operations.
- **Acceptance Criteria**: Timeline and list views with filters by status, date range, and ports. Sort by departure or estimated arrival.

**Cancel a shipment** so that errors can be rectified.
- **Acceptance Criteria**: Sets status to 'cancelled' with mandatory reason field. Notifies affected clients and crew.

### 6. Clients Management

**As an Admin, I want to:**

**Add a new client** so that we can manage their shipments.
- **Acceptance Criteria**: Form with required fields (first_name, last_name) and optional fields (email, phone). Email must be unique if provided.

**Edit client information** so that contact details stay current.
- **Acceptance Criteria**: Email changes re-check uniqueness. Address updates don't affect existing shipments.

**View all clients** so that I can manage relationships.
- **Acceptance Criteria**: Search by name, filter by activity status. Sort by last interaction date or total shipments.

**Deactivate a client** so that inactive accounts don't appear in new orders.
- **Acceptance Criteria**: Toggle `is_active` flag; preserves all historical shipment data.

---

## Technical Architecture

### Backend Structure
```
backend/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.js      # Authentication & user management
│   │   ├── ship.controller.js      # Ship CRUD operations
│   │   ├── crew.controller.js      # Crew management
│   │   ├── client.controller.js    # Client operations
│   │   ├── cargo.controller.js     # Cargo tracking
│   │   ├── shipment.controller.js  # Shipment management
│   │   ├── port.controller.js      # Port operations
│   │   ├── dashboard.controller.js # Real-time dashboard
│   │   └── analytics.controller.js # Business intelligence
│   ├── routes/
│   │   └── [corresponding route files]
│   ├── middleware/
│   │   └── auth.middleware.js      # JWT authentication
│   ├── app.js                      # Express app configuration
│   └── server.js                   # Application entry point
├── prisma/
│   ├── schema.prisma              # Database schema
│   ├── migrations/                # Database migrations
│   └── seeds/                     # Sample data
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── forms/                 # Form components for each entity
│   │   ├── Dashboard.tsx          # Real-time operational dashboard
│   │   ├── Layout.tsx             # Main application layout
│   │   ├── ProtectedRoute.tsx     # Route protection
│   │   └── Analytics.tsx          # Business analytics
│   ├── pages/
│   │   ├── Ships.tsx              # Ship management
│   │   ├── ShipDetail.tsx         # Individual ship details
│   │   ├── Crew.tsx               # Crew management
│   │   ├── Clients.tsx            # Client management
│   │   ├── Cargo.tsx              # Cargo management
│   │   ├── Shipments.tsx          # Shipment operations
│   │   ├── Ports.tsx              # Port management
│   │   ├── Login.tsx              # Authentication
│   │   └── Register.tsx           # User registration
│   ├── contexts/
│   │   └── AuthContext.tsx        # Authentication state
│   ├── hooks/
│   │   └── use-toast.ts           # Toast notifications
│   └── lib/
│       └── api.ts                 # API client with authentication
```

---

## Development Guidelines

### Database Operations
- All entities support full CRUD operations
- Soft delete using `is_active` flags preserves historical data
- Foreign key relationships maintain data integrity
- Timestamps track creation and modification dates

### Authentication & Security
- JWT-based authentication with HTTP-only cookies
- Password hashing using bcrypt
- Protected routes require valid authentication
- Role-based access control for admin functions

### Data Validation
- Client-side validation with real-time feedback
- Server-side validation for security
- Unique constraints on critical fields (registration numbers, emails)
- Business rule validation (ship capacity vs cargo weight)

### User Experience
- Real-time dashboard updates every 30 seconds
- Toast notifications for user actions
- Loading states and error handling
- Responsive design for all screen sizes
- Intuitive navigation and search functionality

---

## Deployment & Production

### Environment Requirements
- Node.js 18+ 
- PostgreSQL 13+
- Redis (for session management)

### Environment Variables
```bash
# Backend
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
NODE_ENV="production"
PORT=5000

# Frontend
VITE_API_URL="https://your-api-domain.com/api"
```

### Production Deployment
1. Database migrations: `npx prisma migrate deploy`
2. Build frontend: `npm run build`
3. Start backend: `npm start`
4. Configure reverse proxy (nginx)
5. SSL certificate setup
6. Monitoring and logging

---

## System Benefits

### Operational Efficiency
- Centralized maritime logistics management
- Real-time tracking and monitoring
- Automated notifications and alerts
- Streamlined workflow processes

### Business Intelligence
- Comprehensive analytics and reporting
- KPI tracking and performance metrics
- Predictive insights for planning
- Data-driven decision making

### Scalability
- Modern architecture supports growth
- Cloud-ready deployment
- API-first design for integrations
- Modular component structure

### User Experience
- Intuitive interface design
- Mobile-responsive layouts
- Real-time updates and notifications
- Comprehensive search and filtering

---

*This system provides a complete solution for maritime cargo management with modern web technologies and best practices for enterprise-level applications.*