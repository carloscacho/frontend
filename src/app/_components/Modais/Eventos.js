import React, { useState } from "react";
import Input from "../utils/Input";
import Button from "../utils/Button";
import { useModal } from "@/context/ModalContext";
import { formatDateToISO } from "@/utils/dateUtils";

export default function Eventos({ onClickSalvar, onClickCancelar, initialData }) {
    const [nome, setNome] = useState("")
    const [dataInicio, setDataInicio] = useState(new Date().toISOString().split('T')[0])
    const [dataFim, setDataFim] = useState(new Date().toISOString().split('T')[0])
    const [ano, setAno] = useState(new Date().getFullYear())
    const { refMd } = useModal()

    React.useEffect(() => {
        if (initialData) {
            setNome(initialData.nome)
            setAno(initialData.ano)
            setDataInicio(initialData.inicio ? initialData.inicio.split('T')[0] : "")
            setDataFim(initialData.final ? initialData.final.split('T')[0] : "")
        }
    }, [initialData])


    return (
        <div className="w-full">
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

            <div className="btns w-full flex justify-end mt-2">
                <Button onClick={() => {
                    const payload = {
                        nome,
                        data_inicio: formatDateToISO(dataInicio),
                        data_fim: formatDateToISO(dataFim),
                        ano: parseInt(ano)
                    };
                    console.log('[Eventos Modal] Payload being sent:', payload);
                    onClickSalvar(payload);
                }} label={initialData ? "Atualizar" : "Salvar"} color="success" mode="active" />
                <Button onClick={onClickCancelar} label="cancelar" color="error" mode="active" />
            </div>
        </div>
    )
}
