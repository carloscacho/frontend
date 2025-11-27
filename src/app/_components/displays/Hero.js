import React from "react";

export default function Hero({ title }) {
  return (
    <div className="hero w-full bg-base-200 pt-5 pb-5">
      <div className="hero-content w-full flex-col">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl text-base-500 font-bold">{title}</h1>
        </div>
      </div>
    </div>
  )
}