'use client'
import React from "react";
import Button from "../utils/Button";

export default function ConfirmDialog({ refModal, title, message, onConfirm, onCancel }) {

    return (
        <dialog ref={refModal} className="modal">
            <div className="modal-box">
                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={() => refModal.current.close()}>✕</button>

                <h3 className="font-bold text-lg text-error">{title || "Confirmar Exclusão"}</h3>
                <p className="py-4">{message || "Tem certeza que deseja excluir este item?"}</p>

                <div className="modal-action">
                    <Button onClick={onCancel} label="Cancelar" color="neutral" mode="active" />
                    <Button onClick={onConfirm} label="Confirmar" color="error" mode="active" />
                </div>
            </div>
        </dialog>
    )
}
