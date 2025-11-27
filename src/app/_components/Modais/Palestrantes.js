import React, { useState } from "react";
import Input from "../utils/Input";
import Button from "../utils/Button";
import { useModal } from "@/context/ModalContext";

export default function Palestrantes({ onClickSalvar, onClickCancelar }) {
    const [nome, setNome] = useState("")
    const [email, setEmail] = useState("")
    const [instituicao, setInstituicao] = useState("")
    const { refMd } = useModal()

    return (
        <div className="w-full">
            <Input
                label="Nome:"
                value={nome}
                onChange={setNome}
                placeholder="Preencha o nome do paletrante"
                type="text"
                badge='obrigatorio'
                badgeColor='error'
            />
            <Input
                label="Email:"
                value={email}
                onChange={setEmail}
                placeholder="Preencha o email do paletrante"
                type="text"
                badge='obrigatorio'
                badgeColor='error'
            />
            <Input
                label="Instituição:"
                value={instituicao}
                onChange={setInstituicao}
                placeholder="Preencha a Instituição do paletrante"
                type="text"
                badge='opcional'

            />

            <div className="btns w-full flex justify-end mt-2">
                <Button onClick={onClickSalvar} label="salvar" color="success" mode="active" />
                <Button onClick={onClickCancelar} label="cancelar" color="error" mode="active" />
            </div>
        </div>
    )
}