import React from 'react'

export default function Input({label, placeholder, value, onChange, type }) {

  return (
    <fieldset className="fieldset">
      <legend className="fieldset-legend text-xl">{label}</legend>
      <input value={value} onChange={(e) => onChange(e.target.value)} type={type} className="input input-info" placeholder={placeholder} />
    </fieldset>
  )
}
