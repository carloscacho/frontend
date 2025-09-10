import React, { useState } from "react";
import Input from "../utils/Input";

export default function Palestrantes() {
    const [nome, setNome] = useState("")
    const [email, setEmail] = useState("")
    const [instituicao, setInstituicao] = useState("")

    return (
        <div>
            <Input
                label="Nome"
                value={nome}
                onChange={setNome}
                placeholder="Preencha o nome do paletrante"
                type="text"
            />
            <Input
                label="Email"
                value={email}
                onChange={setEmail}
                placeholder="Preencha o email do paletrante"
                type="text"
            />
            <Input
                label="Instituição"
                value={instituicao}
                onChange={setInstituicao}
                placeholder="Preencha a Instituição do paletrante"
                type="text"
            />
        </div>
    )
}