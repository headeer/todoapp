"use client";

import { motion } from "framer-motion";

interface CustomCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  checked,
  onChange,
  className = "",
}) => {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className={`form-checkbox h-5 w-5 text-emerald-500 rounded border-gray-300 focus:ring-emerald-500 ${className}`}
    />
  );
};

export default CustomCheckbox;
