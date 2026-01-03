import React, { useId } from "react";

const Switch = React.forwardRef(({ className = "", checked, onCheckedChange, disabled, ...props }, ref) => {
  const id = useId();
  return (
    <div className={`form-switch ${className}`} ref={ref}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        disabled={disabled}
        {...props}
      />
      <label htmlFor={id}>
        <span></span>
      </label>
    </div>
  );
});
Switch.displayName = "Switch";

export { Switch };
