import React from "react";

export default function Select({ selectValue, onChange, options, label }) {
    return (
        <select
            value={selectValue.nome}
            onChange={(e) => onChange(options[e.target.value])}
            defaultValue={label}
            className="select select-primary text-black"
        >
            <option
                disabled={true}>{label}</option>
            {options.map((value, index) => (<option value={index}>{value.nome}</option>))}
        </select>
    )
}