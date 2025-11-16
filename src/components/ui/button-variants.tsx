import { Button } from "./button";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface PrimaryButtonProps {
  children: ReactNode;
  onClick?: (...args: any[]) => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  size?: "default" | "sm" | "lg" | "icon";
}

interface SecondaryButtonProps extends PrimaryButtonProps {}

interface AccentButtonProps extends PrimaryButtonProps {}

export const PrimaryButton = ({ children, className, size, ...props }: PrimaryButtonProps) => (
  <Button 
    size={size}
    className={cn(
      "bg-gradient-primary hover:shadow-product hover:scale-105 transition-all duration-300",
      className
    )} 
    {...props}
  >
    {children}
  </Button>
);

export const SecondaryButton = ({ children, className, size, ...props }: SecondaryButtonProps) => (
  <Button 
    variant="secondary"
    size={size}
    className={cn(
      "hover:shadow-card hover:scale-105 transition-all duration-300",
      className
    )} 
    {...props}
  >
    {children}
  </Button>
);

export const AccentButton = ({ children, className, size, ...props }: AccentButtonProps) => (
  <Button 
    size={size}
    className={cn(
      "bg-gradient-accent hover:shadow-floating hover:scale-105 transition-all duration-300",
      className
    )} 
    {...props}
  >
    {children}
  </Button>
);

export const CartButton = ({ children, className, size, ...props }: PrimaryButtonProps) => (
  <Button 
    size={size}
    className={cn(
      "bg-gradient-primary hover:bg-primary-hover shadow-card hover:shadow-product transition-all duration-300 animate-bounce-in",
      className
    )} 
    {...props}
  >
    {children}
  </Button>
);