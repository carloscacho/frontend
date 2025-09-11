import React from "react";

export default function Hero({children, title}){
    return (
        <div className="hero min-h-screen min-w-md">
        <div className="hero-content w-full flex-col">
          <div className="text-center lg:text-left">
            <h1 className="text-5xl text-base-300 font-bold">{title}</h1>
          </div>
          <div className="flex w-full justify-between">
  
            <div className="overflow-x-auto w-full rounded-box border border-base-content/5 bg-base-100">
                {children}
            </div>
        </div>
      </div>
    </div>
    )
}