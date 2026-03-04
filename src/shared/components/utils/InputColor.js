import React from 'react'
import Input from './Input'

export default function InputColor({ label, value, onChange, placeholder }) {
    return (
        <div className="form-control w-full h-24">
            <label className="label">
                <span className="label-text">{label}</span>
            </label>
            <div className="flex gap-2 items-center">
                <div className="flex-1">
                    <Input
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        type="text"
                    />
                </div>
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="h-12 w-12 p-0 border-0 bg-transparent cursor-pointer"
                />
            </div>
        </div>
    )
}
