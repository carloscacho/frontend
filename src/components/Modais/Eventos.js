import React, { useState } from "react";
import Input from "../utils/Input";
import Button from "../utils/Button";
import { useModal } from "@/context/ModalContext";

export default function Palestrantes() {
    const [nome, setNome] = useState("")
    const [dataInicio, setDataInicio] = useState(new Date())
    const [dataFim, setDataFim] = useState(new Date())
    const [ano, setAno] = useState(new Date().getFullYear())
    const {refMd} = useModal()

    return (
        <div className="w-100">
            <Input
                label="Nome:"
                value={nome}
                onChange={setNome}
                placeholder="Preencha o nome do evento"
                type="text"
                badge='obrigatorio'
                badgeColor='error'
            />
            <Input
                label="Ano:"
                value={ano}
                onChange={setAno}
                placeholder="Preencha o Ano do evento"
                type="number"
                badge='obrigatorio'
                badgeColor='error'
            />
            <Input
                label="Data Inicio:"
                value={dataInicio}
                onChange={setDataInicio}
                placeholder="Preencha a data de inicio do evento"
                type="date"
                badge='obrigatorio'
                badgeColor='error'
                
            />

            <Input
                label="Data Final:"
                value={dataFim}
                onChange={setDataFim}
                placeholder="Preencha a data de inicio do evento"
                type="date"
                badge='obrigatorio'
                badgeColor='error'
                
            />
          
        </div>
    )
}