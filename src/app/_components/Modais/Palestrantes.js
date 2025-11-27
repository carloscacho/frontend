import React, { useState, useEffect } from "react";
import Input from "../utils/Input";
import Button from "../utils/Button";
import { useModal } from "@/context/ModalContext";

export default function Palestrantes({ onClickSalvar, onClickCancelar, initialData }) {
    const [nome, setNome] = useState("")
    const [email, setEmail] = useState("")
    const [instituicao, setInstituicao] = useState("")
    const { refMd } = useModal()

    useEffect(() => {
        if (initialData) {
            setNome(initialData.nome || "")
            setEmail(initialData.email || "")
            setInstituicao(initialData.instituicao || "")
        } else {
            setNome("")
            setEmail("")
            setInstituicao("")
        }
    }, [initialData])

    return (
        <div className="w-full">
            <Input
                label="Nome:"
                value={nome || ""}
                onChange={setNome}
                placeholder="Preencha o nome do paletrante"
                type="text"
                badge='obrigatorio'
                badgeColor='error'
            />
            <Input
                label="Email:"
                value={email || ""}
                onChange={setEmail}
                placeholder="Preencha o email do paletrante"
                type="text"
                badge='obrigatorio'
                badgeColor='error'
            />
            <Input
                label="Instituição:"
                value={instituicao || ""}
                onChange={setInstituicao}
                placeholder="Preencha a Instituição do paletrante"
                type="text"
                badge='opcional'

            />

            <div className="btns w-full flex justify-end mt-2">
                <Button onClick={() => {
                    const payload = { nome, email, instituicao }
                    onClickSalvar(payload)
                }} label={initialData ? "Atualizar" : "Salvar"} color="success" mode="active" />
                <Button onClick={onClickCancelar} label="cancelar" color="error" mode="active" />
            </div>
        </div>
    )
}