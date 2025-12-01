import React from 'react';
import { PiFunnel } from "react-icons/pi";

export default function SortControl({ value, onChange }) {
    const options = [
        { value: "id-desc", label: "ID (Decrescente)" },
        { value: "id-asc", label: "ID (Crescente)" },
        { value: "name-asc", label: "Nome (A-Z)" },
        { value: "name-desc", label: "Nome (Z-A)" },
    ];

    return (
        <>
            {/* Mobile View: Icon Button with Dropdown */}
            <div className="dropdown dropdown-end sm:hidden">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                    <PiFunnel size={24} />
                </div>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                    {options.map((opt) => (
                        <li key={opt.value}>
                            <a onClick={() => {
                                onChange(opt.value);
                                const elem = document.activeElement;
                                if (elem) {
                                    elem.blur();
                                }
                            }} className={value === opt.value ? "active" : ""}>
                                {opt.label}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Desktop View: Select Input */}
            <select
                className="select select-bordered w-full max-w-xs hidden sm:block"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </>
    );
}
