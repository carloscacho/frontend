import React from "react";

export default function TextInputWithButton(props) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 items-center w-full">
      <div className="w-full sm:w-auto flex-grow">
        <label className="input input-bordered flex items-center gap-2 w-full">
          <input
            className="grow"
            value={props.value}
            onChange={(event) => props.onChange(event.target.value)}
            type={props.type || 'text'}
            placeholder={props.placeholder}
          />
        </label>
      </div>
      <div className="flex gap-2 w-full sm:w-auto justify-end items-center">
        {!props.hideButton && (
          <button
            onClick={props.onClick}
            className={`btn btn-success flex-1 sm:flex-none`}
          >
            Cadastrar
          </button>
        )}
        {props.children}
      </div>
    </div>
  )
}