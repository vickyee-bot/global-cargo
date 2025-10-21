import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle, 
  Truck, 
  Ship,
  User,
  Package,
  MapPin
} from 'lucide-react';

export interface StatusConfig {
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
  icon?: React.ReactNode;
}

const statusConfigs: Record<string, StatusConfig> = {
  // Ship statuses
  'active': {
    variant: 'default',
    className: 'bg-green-500 hover:bg-green-600 text-white',
    icon: <CheckCircle className="w-3 h-3" />,
  },
  'under_maintenance': {
    variant: 'secondary',
    className: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    icon: <AlertCircle className="w-3 h-3" />,
  },
  'decommissioned': {
    variant: 'destructive',
    className: 'bg-gray-500 hover:bg-gray-600 text-white',
    icon: <XCircle className="w-3 h-3" />,
  },

  // Shipment statuses
  'pending': {
    variant: 'secondary',
    className: 'bg-blue-500 hover:bg-blue-600 text-white',
    icon: <Clock className="w-3 h-3" />,
  },
  'in_transit': {
    variant: 'default',
    className: 'bg-indigo-500 hover:bg-indigo-600 text-white',
    icon: <Truck className="w-3 h-3" />,
  },
  'delivered': {
    variant: 'default',
    className: 'bg-green-500 hover:bg-green-600 text-white',
    icon: <CheckCircle className="w-3 h-3" />,
  },
  'delayed': {
    variant: 'destructive',
    className: 'bg-red-500 hover:bg-red-600 text-white',
    icon: <AlertCircle className="w-3 h-3" />,
  },
  'cancelled': {
    variant: 'destructive',
    className: 'bg-gray-600 hover:bg-gray-700 text-white',
    icon: <XCircle className="w-3 h-3" />,
  },

  // Cargo types
  'general': {
    variant: 'outline',
    className: 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300',
    icon: <Package className="w-3 h-3" />,
  },
  'perishable': {
    variant: 'default',
    className: 'bg-orange-500 hover:bg-orange-600 text-white',
    icon: <AlertCircle className="w-3 h-3" />,
  },
  'dangerous': {
    variant: 'destructive',
    className: 'bg-red-600 hover:bg-red-700 text-white animate-pulse',
    icon: <AlertCircle className="w-3 h-3" />,
  },
  'other': {
    variant: 'secondary',
    className: 'bg-purple-500 hover:bg-purple-600 text-white',
    icon: <Package className="w-3 h-3" />,
  },

  // Ship types
  'cargo_ship': {
    variant: 'default',
    className: 'bg-blue-600 hover:bg-blue-700 text-white',
    icon: <Ship className="w-3 h-3" />,
  },
  'passenger_ship': {
    variant: 'default',
    className: 'bg-green-600 hover:bg-green-700 text-white',
    icon: <User className="w-3 h-3" />,
  },
  'fishing_vessel': {
    variant: 'secondary',
    className: 'bg-teal-500 hover:bg-teal-600 text-white',
    icon: <Ship className="w-3 h-3" />,
  },
  
  // Crew roles
  'Captain': {
    variant: 'default',
    className: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    icon: <User className="w-3 h-3" />,
  },
  'Chief_Officer': {
    variant: 'default',
    className: 'bg-blue-600 hover:bg-blue-700 text-white',
    icon: <User className="w-3 h-3" />,
  },

  // Priority levels
  'high': {
    variant: 'destructive',
    className: 'bg-red-500 hover:bg-red-600 text-white',
    icon: <AlertCircle className="w-3 h-3" />,
  },
  'medium': {
    variant: 'default',
    className: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    icon: <AlertCircle className="w-3 h-3" />,
  },
  'low': {
    variant: 'secondary',
    className: 'bg-green-500 hover:bg-green-600 text-white',
    icon: <CheckCircle className="w-3 h-3" />,
  },

  // Boolean statuses
  'true': {
    variant: 'default',
    className: 'bg-green-500 hover:bg-green-600 text-white',
    icon: <CheckCircle className="w-3 h-3" />,
  },
  'false': {
    variant: 'destructive',
    className: 'bg-red-500 hover:bg-red-600 text-white',
    icon: <XCircle className="w-3 h-3" />,
  },
};

interface StatusBadgeProps {
  status: string | boolean;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  customLabel?: string;
  className?: string;
}

export function StatusBadge({ 
  status, 
  showIcon = true, 
  size = 'md', 
  customLabel,
  className 
}: StatusBadgeProps) {
  const statusKey = typeof status === 'boolean' ? status.toString() : status.toLowerCase();
  const config = statusConfigs[statusKey] || statusConfigs['general'];
  
  const label = customLabel || (typeof status === 'boolean' 
    ? (status ? 'Active' : 'Inactive')
    : status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <Badge
      variant={config.variant}
      className={cn(
        config.className,
        sizeClasses[size],
        'inline-flex items-center gap-1.5 font-medium transition-colors',
        className
      )}
    >
      {showIcon && config.icon}
      <span>{label}</span>
    </Badge>
  );
}

// Specialized status badges for different entities
export const ShipStatusBadge = ({ status }: { status: string }) => (
  <StatusBadge status={status} />
);

export const ShipmentStatusBadge = ({ status }: { status: string }) => (
  <StatusBadge status={status} />
);

export const CargoTypeBadge = ({ type }: { type: string }) => (
  <StatusBadge status={type} />
);

export const PriorityBadge = ({ priority }: { priority: string }) => (
  <StatusBadge status={priority} />
);

export const ActiveBadge = ({ isActive }: { isActive: boolean }) => (
  <StatusBadge status={isActive} />
);