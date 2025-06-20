import React from 'react';
import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';
import { AlertTriangle, X } from 'lucide-react';

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        warning: "border-yellow-500/50 text-yellow-700 dark:border-yellow-500 [&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-500 bg-yellow-500/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef(({ className, variant, children, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  >
    {children}
  </div>
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef(({ className, children, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  >
    {children}
  </h5>
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  >
    {children}
  </div>
));
AlertDescription.displayName = "AlertDescription";

const AlertIcon = ({ icon: IconComponent = AlertTriangle, className, ...props }) => (
  <IconComponent className={cn("h-4 w-4", className)} {...props} />
);
AlertIcon.displayName = "AlertIcon";

const AlertCloseButton = React.forwardRef(({ className, onClick, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn(
      "absolute right-3 top-3 rounded-md p-1 text-foreground/50 opacity-70 transition-opacity hover:text-foreground hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none",
      className
    )}
    onClick={onClick}
    {...props}
  >
    <X className="h-4 w-4" />
    <span className="sr-only">Dismiss</span>
  </button>
));
AlertCloseButton.displayName = "AlertCloseButton";


export { Alert, AlertTitle, AlertDescription, AlertIcon, AlertCloseButton };