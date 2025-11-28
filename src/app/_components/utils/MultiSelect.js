import React from "react";

export default function MultiSelect({ options, selectedValues, onChange, label, valueKey = "id", labelKey = "nome" }) {
    const handleCheckboxChange = (value) => {
        if (selectedValues.includes(value)) {
            onChange(selectedValues.filter(item => item !== value));
        } else {
            onChange([...selectedValues, value]);
        }
    };

    return (
        <div className="form-control w-full">
            <label className="label">
                <span className="label-text font-bold">{label}</span>
            </label>
            <div className="flex flex-wrap gap-2 p-2 border rounded-lg border-gray-300 bg-white max-h-40 overflow-y-auto">
                {options.length > 0 ? (
                    options.map((opt) => (
                        <label key={opt[valueKey]} className="cursor-pointer label justify-start gap-2 border p-1 rounded hover:bg-gray-100">
                            <input
                                type="checkbox"
                                className="checkbox checkbox-sm checkbox-primary"
                                checked={selectedValues.includes(opt[valueKey])}
                                onChange={() => handleCheckboxChange(opt[valueKey])}
                            />
                            <span className="label-text text-sm">{opt[labelKey]}</span>
                        </label>
                    ))
                ) : (
                    <span className="text-gray-500 text-sm p-1">Nenhum item disponível</span>
                )}
            </div>
        </div>
    );
}
