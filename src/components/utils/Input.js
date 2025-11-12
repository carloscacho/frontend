import React from 'react'

export default function Input({ label, placeholder, value, onChange, type, badge, badgeColor }) {

  return (
    <div class="relative w-full my-2">
  <input 
    id={label}
    class="peer input input-bordered w-full bg-transparent text-base text-gray-900 
           focus:border-primary focus:outline-none"
    placeholder=" " 
    value={value}
    onChange={(e) => onChange(e.target.value)}
    type={type}
  />
  <label 
    for={label}
    class="absolute left-3 top-2 text-gray-500 duration-300 transform 
           -translate-y-3 scale-75 origin-[0] 
           peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 
           peer-focus:bg-base-100 peer-focus:z-10 peer-focus:px-2 peer-focus:font-bold
           peer-focus:-translate-y-4.5 peer-focus:scale-75 peer-focus:text-primary"
  >
    {label}
  </label>
</div>


  )
}
