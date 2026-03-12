import React, { useEffect, useRef, useState } from "react";

type SelectOption = {
  label: string;
  value: string;
};

type CustomSelectProps = {
  options: SelectOption[];
  value: string;
  onChange: (option: SelectOption) => void;
};

const CustomSelect = ({ options, value, onChange }: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption =
    options.find((option) => option.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (selectRef.current && !selectRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={selectRef}
      className="dropdown-content custom-select relative shrink-0"
      style={{ minWidth: "200px" }}
    >
      <button
        type="button"
        className={`select-selected whitespace-nowrap w-full text-left ${
          isOpen ? "select-arrow-active" : ""
        }`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {selectedOption.label}
      </button>

      <div className={`select-items ${isOpen ? "" : "select-hide"}`}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              onChange(option);
              setIsOpen(false);
            }}
            className={`select-item w-full text-left ${
              selectedOption.value === option.value ? "same-as-selected" : ""
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CustomSelect;
