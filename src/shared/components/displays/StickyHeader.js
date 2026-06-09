import React from 'react';

export default function StickyHeader({ title, description }) {
    return (
        <div className="sticky top-6 z-20 bg-base-200 border-b border-base-300 px-6 py-4">
            <h1 className="text-3xl font-bold">{title}</h1>
            {description && (
                <p className="text-sm text-base-content/70 mt-1">{description}</p>
            )}
        </div>
    );
}
