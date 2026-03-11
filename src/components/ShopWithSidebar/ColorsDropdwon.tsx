"use client";
import React, { useState } from "react";

type ColorsDropdwonProps = {
  colors: string[];
  selectedColor: string;
  onColorChange: (value: string) => void;
};

const ColorsDropdwon = ({
  colors,
  selectedColor,
  onColorChange,
}: ColorsDropdwonProps) => {
  const [toggleDropdown, setToggleDropdown] = useState(true);
  const normalizedColors = colors.length ? colors : ["#3C50E0"];

  return (
    <div className="bg-white shadow-1 rounded-lg">
      <div
        onClick={() => setToggleDropdown(!toggleDropdown)}
        className={`cursor-pointer flex items-center justify-between py-3 pl-6 pr-5.5 ${
          toggleDropdown && "shadow-filter"
        }`}
      >
        <p className="text-dark">Colors</p>
        <button
          aria-label="button for colors dropdown"
          className={`text-dark ease-out duration-200 ${
            toggleDropdown && "rotate-180"
          }`}
        >
          <svg
            className="fill-current"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M4.43057 8.51192C4.70014 8.19743 5.17361 8.161 5.48811 8.43057L12 14.0122L18.5119 8.43057C18.8264 8.16101 19.2999 8.19743 19.5695 8.51192C19.839 8.82642 19.8026 9.29989 19.4881 9.56946L12.4881 15.5695C12.2072 15.8102 11.7928 15.8102 11.5119 15.5695L4.51192 9.56946C4.19743 9.29989 4.161 8.82641 4.43057 8.51192Z"
              fill=""
            />
          </svg>
        </button>
      </div>

      {/* <!-- dropdown menu --> */}
      <div
        className={`flex-wrap gap-2.5 p-6 ${
          toggleDropdown ? "flex" : "hidden"
        }`}
      >
        {normalizedColors.map((color, key) => (
          <label
            key={key}
            htmlFor={`color-${key}`}
            className="cursor-pointer select-none flex items-center"
          >
            <div className="relative">
              <input
                type="radio"
                name="color"
                id={`color-${key}`}
                className="sr-only"
                checked={selectedColor === color}
                onChange={() =>
                  onColorChange(selectedColor === color ? "" : color)
                }
              />
              <div
                className={`flex items-center justify-center w-5.5 h-5.5 rounded-full ${
                  selectedColor === color && "border"
                }`}
                style={{ borderColor: `${color}` }}
              >
                <span
                  className="block w-3 h-3 rounded-full"
                  style={{ backgroundColor: `${color}` }}
                ></span>
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

export default ColorsDropdwon;
