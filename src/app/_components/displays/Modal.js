'use client'
import { useModal } from "@/context/ModalContext";
import React from "react";
import Button from "../utils/Button";


export default function Modal({ children, refModal, onClickSalvar, onClickCancelar }) {

    const { refMd, setRefMd } = useModal()

    setRefMd(refModal)

    return (
        <dialog ref={refMd} id="my_modal_3" className="modal">
            <div className="modal-box">
                <form method="dialog">
                    {/* if there is a button in form, it will close the modal */}
                    <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>

                    {children}

                    <div className="btns w-full flex justify-end mt-2">
                        <Button onClick={onClickSalvar} label="salvar" color="success" mode="active" />
                        <Button onClick={onClickCancelar} label="cancelar" color="error" mode="active" />
                    </div>
                </form>
            </div>
        </dialog>
    )
}