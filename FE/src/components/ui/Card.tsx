import type { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({
  children,
  hover = true,
  padding = 'md',
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={`glass-card ${paddingClasses[padding]} ${hover ? '' : 'hover:transform-none hover:shadow-none'} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
