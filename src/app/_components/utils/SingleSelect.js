import React, { useState, useRef, useEffect } from "react";
import { PiX } from "react-icons/pi";

export default function SingleSelect({ options, value, onChange, label, valueKey = "id", labelKey = "nome", labelBgColor = "bg-base-100" }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const handleSelect = (option) => {
        onChange(option);
        setSearchTerm("");
        setIsOpen(false);
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange(null);
        setSearchTerm("");
    };

    // Filter options
    const filteredOptions = options.filter(opt =>
        opt[labelKey].toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedLabel = value ? value[labelKey] : "";
    const hasValue = value || searchTerm || isOpen;

    return (
        <div className="relative w-full my-3 py-0.5" ref={wrapperRef}>
            <div
                className={`flex items-center gap-2 px-3 py-2 border rounded-lg bg-transparent min-h-[3rem] relative cursor-text transition-all duration-200
                    ${isOpen ? 'border-primary ring-1 ring-primary' : 'border-gray-300'}`}
                onClick={() => {
                    setIsOpen(true);
                    const input = wrapperRef.current?.querySelector('input');
                    if (input) input.focus();
                }}
            >
                {/* Badge for selected value */}
                {value && (
                    <div className="badge badge-primary gap-1 p-3 max-w-[85%]">
                        <span className="truncate">{selectedLabel}</span>
                        {/* <button
                            onClick={handleClear}
                            className="hover:text-white/80 flex-shrink-0"
                            type="button"
                        >
                            <PiX />
                        </button> */}
                    </div>
                )}

                <input
                    type="text"
                    className="flex-1 outline-none bg-transparent min-w-[50px] text-base-content placeholder-gray-400"
                    placeholder=""
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                />
            </div>

            {/* Floating Label */}
            <label
                className={`absolute left-3 top-2 text-gray-500 duration-300 transform origin-left ${labelBgColor} px-2 z-10 pointer-events-none
                    ${hasValue ? '-translate-y-5 scale-75 text-primary font-bold' : 'translate-y-0 scale-100'}`}
            >
                {label}
            </label>

            {/* Dropdown */}
            {isOpen && (
                <ul className="absolute left-0 right-0 top-full mt-1 bg-base-100 border border-base-300 shadow-lg rounded-box max-h-60 overflow-y-auto z-50">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((opt) => (
                            <li
                                key={opt[valueKey]}
                                className={`px-4 py-2 hover:bg-base-200 cursor-pointer transition-colors ${value && value[valueKey] === opt[valueKey] ? 'bg-base-200 font-bold' : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelect(opt);
                                }}
                            >
                                {opt[labelKey]}
                            </li>
                        ))
                    ) : (
                        <li className="px-4 py-2 text-base-content/50 text-sm">
                            Nenhum resultado encontrado.
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
}
