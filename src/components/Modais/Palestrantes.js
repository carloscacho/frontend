import React, { useState } from "react";
import Input from "../utils/Input";
import Button from "../utils/Button";
import { useModal } from "@/context/ModalContext";

export default function Palestrantes() {
    const [nome, setNome] = useState("")
    const [email, setEmail] = useState("")
    const [instituicao, setInstituicao] = useState("")
    const {refMd} = useModal()

    return (
        <div className="w-100">
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
          
        </div>
    )
}