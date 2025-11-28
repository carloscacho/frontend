import React, { useState, useEffect } from "react";
import Input from "../utils/Input";
import Select from "../utils/Select";
import MultiSelect from "../utils/MultiSelect";
import SingleSelect from "../utils/SingleSelect";
import Button from "../utils/Button";
import { getAllRecords } from "@/utils/crud";
import { useEventFilter } from "@/context/EventFilterContext";

export default function Atividades({ onClickSalvar, onClickCancelar, initialData }) {
    const [nome, setNome] = useState("");
    const [descricao, setDescricao] = useState("");
    const [observacao, setObservacao] = useState("");
    const [limite, setLimite] = useState("");
    const [sala, setSala] = useState(null); // Object
    const [palestrantes, setPalestrantes] = useState([]); // Array of IDs
    const [data, setData] = useState("");
    const [hora, setHora] = useState("");
    const [duracao, setDuracao] = useState("");

    const [salasOptions, setSalasOptions] = useState([]);
    const [palestrantesOptions, setPalestrantesOptions] = useState([]);

    const { eventoSelect } = useEventFilter();

    useEffect(() => {
        async function fetchData() {
            try {
                const salas = await getAllRecords('/sala');
                setSalasOptions(salas);
                const palestrantesList = await getAllRecords('/palestrante');
                setPalestrantesOptions(palestrantesList);
            } catch (error) {
                console.error("Error fetching options:", error);
            }
        }
        fetchData();
    }, []);

    useEffect(() => {
        if (initialData) {
            setNome(initialData.nome);
            setDescricao(initialData.descricao || "");
            setObservacao(initialData.observacao || "");
            setLimite(initialData.limite || "");
            if (initialData.sala) {
                setSala(initialData.sala);
            } else if (initialData.fk_sala) {
                // If we only have ID, we might need to find it in options, but options might not be loaded yet.
                // Ideally initialData should have the object or we wait for options.
                // For now, let's assume we might need to handle this.
            }
            // Handle palestrantes and data_atividade if present
            if (initialData.palestrante_atividade) {
                setPalestrantes(initialData.palestrante_atividade.map(pa => pa.fk_palestrante));
            }
            if (initialData.data_atividade && initialData.data_atividade.length > 0) {
                const da = initialData.data_atividade[0];
                setData(da.data ? da.data.split('T')[0] : "");
                setHora(da.hora ? da.hora.split('T')[1].substring(0, 5) : "");
                setDuracao(da.duracao ? da.duracao.split('T')[1].substring(0, 5) : "");
            }
        } else {
            // Reset fields for create mode
            setNome("");
            setDescricao("");
            setObservacao("");
            setLimite("");
            setSala(null);
            setPalestrantes([]);
            setData("");
            setHora("");
            setDuracao("");
        }
    }, [initialData]);

    const handleSubmit = () => {
        const payload = {
            nome,
            descricao,
            observacao,
            limite: parseInt(limite),
            fk_sala: sala ? sala.id_sala : null,
            fk_evento: eventoSelect?.id_evento,
            palestrantes,
            data_atividade: {
                data,
                hora,
                duracao
            }
        };
        onClickSalvar(payload);
    };

    return (
        <div className="w-full flex flex-col gap-2">
            <Input
                label="Nome:"
                value={nome}
                onChange={setNome}
                placeholder="Nome da atividade"
                type="text"
                badge='obrigatorio'
                badgeColor='error'
            />
            <Input
                label="Descrição:"
                value={descricao}
                onChange={setDescricao}
                placeholder="Descrição"
                type="text"
            />
            <Input
                label="Observação:"
                value={observacao}
                onChange={setObservacao}
                placeholder="Observação"
                type="text"
            />
            <div className="flex gap-2">
                <div className="w-32">
                    <Input
                        label="Limite:"
                        value={limite}
                        onChange={setLimite}
                        placeholder="Limite de vagas"
                        type="number"
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <SingleSelect
                        label="Local"
                        options={salasOptions}
                        value={sala}
                        onChange={setSala}
                        valueKey="id_sala"
                        labelKey="nome"
                    />
                </div>
            </div>

            <MultiSelect
                options={palestrantesOptions}
                selectedValues={palestrantes}
                onChange={setPalestrantes}
                label="Palestrantes"
                valueKey="id_palestrante"
                labelKey="nome"
            />

            <div className="flex gap-2">
                <Input
                    label="Data:"
                    value={data}
                    onChange={setData}
                    type="date"
                    badge='obrigatorio'
                    badgeColor='error'
                />
                <Input
                    label="Hora Início:"
                    value={hora}
                    onChange={setHora}
                    type="time"
                    badge='obrigatorio'
                    badgeColor='error'
                />
                <Input
                    label="Duração:"
                    value={duracao}
                    onChange={setDuracao}
                    type="time"
                />
            </div>

            <div className="btns w-full flex justify-end mt-4">
                <Button onClick={handleSubmit} label={initialData ? "Atualizar" : "Salvar"} color="success" mode="active" />
                <Button onClick={onClickCancelar} label="Cancelar" color="error" mode="active" />
            </div>
        </div>
    )
}
