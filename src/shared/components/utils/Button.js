import React from "react";


export default function Button({onClick, mode, color, label}) {
    return (
        <button
            onClick={onClick}
            className={`btn btn-${mode || 'soft'} btn-${color || 'neutral'} ml-2`}
        >
            {label}
        </button>
    )
}