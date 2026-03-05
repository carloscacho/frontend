import React from "react";


export default function Button({ onClick, mode, color, label, children, className = '', type = "button", ...props }) {
    const modeClass = mode !== undefined ? (mode ? `btn-${mode}` : '') : 'btn-soft';
    const colorClass = color !== undefined ? (color ? `btn-${color}` : '') : 'btn-neutral';

    const marginClass = className.includes('m-') || className.includes('ml-') || className.includes('mr-') || className.includes('mx-') || className.includes('my-') ? '' : 'ml-2';

    return (
        <button
            type={type}
            onClick={onClick}
            className={`btn ${modeClass} ${colorClass} ${marginClass} ${className}`.trim().replace(/\s+/g, ' ')}
            {...props}
        >
            {children || label}
        </button>
    );
}