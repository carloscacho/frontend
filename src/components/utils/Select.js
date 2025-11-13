import React from "react";

export default function Select({ selectValue, onChange, options, label,  valueKey = "id", labelKey = "nome" }) {
    return (
        <select
            value={selectValue?.[valueKey] || ""}
            onChange={(e) => {
                const selected = options.find(opt => opt[valueKey] == e.target.value)
                onChange(selected || {})
            }}
            className="select select-primary text-black"
        >
            <option disabled>{label}</option>
            {options.map((opt) => (
                <option key={opt[valueKey]} value={opt[valueKey]}>
                    {opt[labelKey]}
                </option>
            ))}
        </select>
    )
}