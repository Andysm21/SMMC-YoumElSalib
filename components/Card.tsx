/**
 * Card Component
 * A reusable card component for displaying content sections
 */

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  bordered?: boolean;
}

export function Card({
  children,
  className,
  hoverable = false,
  bordered = true,
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg bg-white dark:bg-slate-900 p-6",
        bordered && "border border-slate-200 dark:border-slate-700",
        hoverable &&
          "hover:shadow-lg dark:hover:shadow-slate-700/50 transition-shadow",
        className
      )}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn("mb-4 pb-4 border-b border-slate-200 dark:border-slate-700", className)}>
      {children}
    </div>
  );
}

export interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

export function CardBody({ children, className }: CardBodyProps) {
  return <div className={cn("mb-4", className)}>{children}</div>;
}

export interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn("pt-4 border-t border-slate-200 dark:border-slate-700", className)}>
      {children}
    </div>
  );
}
