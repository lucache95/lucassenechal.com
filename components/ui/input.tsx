import { forwardRef, type InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", disabled, ...props }, ref) => {
    return (
      <input
        ref={ref}
        disabled={disabled}
        className={`
          w-full rounded-lg border border-border bg-surface px-4 py-3
          text-base text-foreground placeholder:text-muted-foreground
          transition-all duration-200 ease-out
          focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20
          disabled:pointer-events-none disabled:opacity-50
          ${className}
        `.trim()}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;
