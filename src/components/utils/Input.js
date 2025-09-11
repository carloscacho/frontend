import React from 'react'

export default function Input({ label, placeholder, value, onChange, type, badge, badgeColor }) {

  return (
    // <fieldset className="fieldset">
    //   <legend className="fieldset-legend text-xl">{label}</legend>
    //   <input value={value} onChange={(e) => onChange(e.target.value)} type={type} className="input input-info" placeholder={placeholder} />
    // </fieldset>

    <label className="input m-2 w-100">
      {label}
      <input value={value} onChange={(e) => onChange(e.target.value)} type={type} className="grow" placeholder={placeholder} />
      <span className={`badge badge-${badgeColor || 'neutral'} badge-xs`}>{badge}</span>
    </label>
  )
}
