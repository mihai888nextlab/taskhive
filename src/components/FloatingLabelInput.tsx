import React, { useState, InputHTMLAttributes } from "react";

interface FloatingLabelInputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
}

const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  id,
  label,
  type = "text",
  onChange,
  onFocus,
  onBlur,
  ...props
}) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onChange && onChange(e);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus && onFocus(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur && onBlur(e);
  };

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
        className="
          peer
          w-full p-3 pt-6
          border border-primary-300 dark:border-primary-600
          rounded-md
          bg-background dark:bg-primary-900
          text-text dark:text-text
          focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-accent
          transition-all duration-200 ease-in-out
          placeholder-transparent
          font-sans
        "
        placeholder={label}
        {...props}
      />
      <label
        htmlFor={id}
        className={`
          absolute
          left-3
          cursor-text
          text-secondary dark:text-tertiary
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
};

export default FloatingLabelInput;
