import React, { useState, useEffect } from "react";
import Input from "@/shared/components/utils/Input";
import Button from "@/shared/components/utils/Button";
import { useEventFilter } from "@/shared/contexts/EventFilterContext";

export default function Palestrantes({ onClickSalvar, onClickCancelar, initialData }) {
    const [nome, setNome] = useState("")
    const [email, setEmail] = useState("")
    const [instituicao, setInstituicao] = useState("")

    const { eventoSelect } = useEventFilter();

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
                type="email"
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

            <div className="btns w-full flex justify-end mt-4 gap-2">
                <Button onClick={onClickCancelar} label="Cancelar" color="error" mode="active" />
                <Button onClick={() => {
                    const payload = {
                        nome,
                        email,
                        instituicao
                    }

                    // If creating a new speaker, link to the selected event
                    if (!initialData && eventoSelect?.id_evento) {
                        payload.eventos = [eventoSelect.id_evento];
                    }

                    onClickSalvar(payload)
                }} label={initialData ? "Atualizar" : "Salvar"} color="success" mode="active" />
            </div>
        </div>
    )
}