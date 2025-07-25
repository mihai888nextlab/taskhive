import React, { useState, InputHTMLAttributes, useCallback } from "react";
/** @jsx React.createElement */

interface FloatingLabelInputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  theme?: "light" | "dark";
}

const FloatingLabelInput: React.FC<FloatingLabelInputProps> = React.memo(
  ({
    id,
    label,
    type = "text",
    onChange,
    onFocus,
    onBlur,
    theme = "dark",
    ...props
  }) => {
    const [inputValue, setInputValue] = useState<string>("");
    const [isFocused, setIsFocused] = useState<boolean>(false);

    // Memoize handlers
    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        if (onChange) {
          onChange(e);
        }
      },
      [onChange]
    );

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        if (onFocus) {
          onFocus(e);
        }
      },
      [onFocus]
    );

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        if (onBlur) {
          onBlur(e);
        }
      },
      [onBlur]
    );

    const isLabelFloated = isFocused || inputValue !== "";

    return (
      <div className="relative w-full">
        <input
          id={id}
          type={type}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`peer w-full p-3 pt-6
          border
          rounded-md
          ${theme == "light" ? "bg-transparent " : "bg-background "}
          ${theme == "light" ? "text-black" : "text-text"}
          focus:outline-none focus:ring-2 focus:ring-primary
          transition-all duration-200 ease-in-out
          placeholder-transparent
          font-sans
        `}
          placeholder={label}
          {...props}
        />
        <label
          htmlFor={id}
          className={`
          absolute
          left-3
          cursor-text
          ${theme == "light" ? "text-gray-500" : "text-secondary"}
          transition-all duration-200 ease-in-out
          ${
            isLabelFloated
              ? "top-2 text-xs"
              : "top-1/2 -translate-y-1/2 text-base"
          }
          peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary dark:peer-focus:text-primary
          font-sans
        `}
        >
          {label}
        </label>
      </div>
    );
  }
);

export default FloatingLabelInput;
