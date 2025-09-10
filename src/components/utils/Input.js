import React from 'react'

export default function Input({label, placeholder, value, onChange, type }) {

  return (
    <fieldset className="fieldset">
      <legend className="fieldset-legend text-2xl">{label}</legend>
      <input value={value} onChange={onChange} type={type} className="input input-info" placeholder={placeholder} />
    </fieldset>
  )
}
