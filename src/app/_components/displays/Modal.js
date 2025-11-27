'use client'
import React from "react";


export default function Modal({ children, refModal }) {
    return (
        <dialog ref={refModal} className="modal">
            <div className="modal-box">
                <form method="dialog">
                    {/* if there is a button in form, it will close the modal */}
                    <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>

                    {children}


                </form>
            </div>
        </dialog>
    )
}