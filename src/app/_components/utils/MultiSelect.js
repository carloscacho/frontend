import React, { useState, useRef, useEffect } from "react";
import { PiX } from "react-icons/pi";

export default function MultiSelect({ options, selectedValues, onChange, label, valueKey = "id", labelKey = "nome" }) {
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

    const handleSelect = (value) => {
        onChange([...selectedValues, value]);
        setSearchTerm("");
        // Keep focus or keep open? Usually close or keep open for multiple. 
        // User said "clickar em um... ele é colocado". 
        // Let's keep it open to allow selecting more, or close it. 
        // Typically for tags, you might want to select multiple. Let's keep focus on input.
    };

    const handleRemove = (value) => {
        onChange(selectedValues.filter(item => item !== value));
    };

    // Filter options: match search term AND not already selected
    const filteredOptions = options.filter(opt =>
        opt[labelKey].toLowerCase().includes(searchTerm.toLowerCase()) &&
        !selectedValues.includes(opt[valueKey])
    );

    // Get selected objects to display tags
    const selectedObjects = options.filter(opt => selectedValues.includes(opt[valueKey]));

    return (
        <div className="form-control w-full" ref={wrapperRef}>
            <label className="label">
                <span className="label-text font-bold">{label}</span>
            </label>

            <div className="flex flex-wrap items-center gap-2 p-2 border rounded-lg border-gray-300 bg-transparent min-h-[3rem] focus-within:border-primary focus-within:ring-1 focus-within:ring-primary relative">
                {/* Tags */}
                {selectedObjects.map((opt) => (
                    <div key={opt[valueKey]} className="badge badge-primary gap-1 p-3">
                        {opt[labelKey]}
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent opening dropdown if clicking X
                                handleRemove(opt[valueKey]);
                            }}
                            className="hover:text-white/80"
                        >
                            <PiX />
                        </button>
                    </div>
                ))}

                {/* Input */}
                <input
                    type="text"
                    className="flex-1 outline-none bg-transparent min-w-[100px]"
                    placeholder={selectedValues.length === 0 ? "Digite para buscar..." : ""}
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                />

                {/* Dropdown */}
                {isOpen && (filteredOptions.length > 0 || searchTerm) && (
                    <ul className="absolute left-0 right-0 top-full mt-1 bg-base-100 border border-base-300 shadow-lg rounded-box max-h-60 overflow-y-auto z-50">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => (
                                <li
                                    key={opt[valueKey]}
                                    className="px-4 py-2 hover:bg-base-200 cursor-pointer transition-colors"
                                    onClick={() => handleSelect(opt[valueKey])}
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
        </div>
    );
}
