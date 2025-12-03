import React from 'react'

export default function Card({ children, figure }) {
  return (
    <div className="card card-border w-full bg-base-100 shadow-sm">
      {figure && <figure>{figure}</figure>}
      <div className="card-body">
        {children}
      </div>
    </div>
  )
}
