import React from "react";

export default function TextInputWithButton(props) {
  return (
    <div className="flex">
      <div>
        <label className="input validator">
          <input
            className="w-3xs mx-7"
            value={props.value}
            onChange={(event) => props.onChange(event.target.value)}
            type={props.type || 'text'} placeholder={props.placeholder} />
        </label>
      </div>
      <button
        onClick={props.onClick}
        className={`btn btn-${props.btncolor || 'primary'}`}
      >
        {props.btnLabel}
      </button>
    </div>
  )
}