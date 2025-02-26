"use client";

import { motion } from "framer-motion";

interface CustomCheckboxProps {
  checked: boolean;
  onChange: () => void;
  id?: string;
}

export default function CustomCheckbox({
  checked,
  onChange,
  id,
}: CustomCheckboxProps) {
  return (
    <label className="custom-checkbox cursor-pointer" htmlFor={id}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        id={id}
        className="sr-only"
      />
      <div className="checkbox-icon">
        <motion.svg
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: checked ? 1 : 0,
            scale: checked ? 1 : 0.5,
          }}
          transition={{ duration: 0.2 }}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </motion.svg>
      </div>
    </label>
  );
}
