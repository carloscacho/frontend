import React, { useState } from 'react'
import { GoEyeClosed, GoEye } from "react-icons/go";

export default function Input({ label, placeholder, value, onChange, type, badge, badgeColor }) {
  const isPasswordType = type === 'password';
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative w-full my-3 py-0.5">
      <input
        id={label}
        className={`peer input input-bordered w-full bg-transparent text-base text-base-content 
           focus:border-primary focus:outline-none py-6 ${value ? 'border-primary' : ''}`}
        placeholder=" "
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        type={isPasswordType ? (showPassword ? 'text' : 'password') : type}
      />
      <label
        htmlFor={label}
        className={`absolute left-3 top-2 duration-300 transform 
           -translate-y-5 scale-75 origin-left bg-base-100 px-2 z-10
           peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:bg-transparent peer-placeholder-shown:px-0 peer-placeholder-shown:z-auto
           peer-focus:-translate-y-5 peer-focus:scale-75 peer-focus:bg-base-100 peer-focus:z-10 peer-focus:px-2 peer-focus:font-bold peer-focus:text-primary
           ${value ? 'text-primary font-bold' : 'text-gray-500'}`}
      >
        {label}
      </label>
      
      {isPasswordType && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary focus:outline-none"
        >
          {showPassword ? (
             <GoEye size={24} />
          ) : (
             <GoEyeClosed size={24} />
          )}
        </button>
      )}
    </div>


  )
}
