import React from "react";

export default function PageContainer({ children }) {
    return (
        <div className="hero min-h-screen w-full mt-6 relative z-0">
            <div className="hero-content w-full flex-col">
                <div className="flex w-full justify-between">
                    <div className="overflow-x-auto w-full rounded-box border border-base-content/5 bg-base-100">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}
