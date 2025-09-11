import React from "react";

export default function TextInputWithButton(props) {
  return (
    <div className="flex">
      <div>
        <label className="input validator">
          <input
            className="w-2xs mx-7"
            value={props.value}
            onChange={(event) => props.onChange(event.target.value)}
            type={props.type || 'text'} placeholder={props.placeholder} />
        </label>
      </div>
      <button
        onClick={props.onClick}
        className={`btn btn-info`}
      >
        {props.btnLabel}
      </button>
      <button
        onClick={props.onClick}
        className={`btn ml-3 btn-success`}
      >
        cadastrar
      </button>
    </div>
  )
}