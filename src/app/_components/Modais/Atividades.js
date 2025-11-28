import React, { useState, useEffect } from "react";
import Input from "../utils/Input";
import Select from "../utils/Select";
import MultiSelect from "../utils/MultiSelect";
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
                <Input
                    label="Limite:"
                    value={limite}
                    onChange={setLimite}
                    placeholder="Limite de vagas"
                    type="number"
                />
                <div className="relative w-full my-3 py-0.5">
                    <select
                        className="input input-bordered w-full bg-transparent text-base text-gray-900 focus:border-primary focus:outline-none appearance-none"
                        value={sala?.id_sala || ""}
                        onChange={(e) => {
                            const selected = salasOptions.find(opt => opt.id_sala == Number(e.target.value))
                            setSala(selected || {})
                        }}
                    >
                        <option value="" disabled hidden></option>
                        {salasOptions.map((opt) => (
                            <option key={opt.id_sala} value={opt.id_sala}>
                                {opt.nome}
                            </option>
                        ))}
                    </select>
                    <label
                        className={`absolute left-3 top-2 text-gray-500 duration-300 transform origin-left pointer-events-none
                            ${sala ? '-translate-y-5 scale-75 text-primary font-bold bg-white px-2 z-10' : 'translate-y-0 scale-100'}`}
                    >
                        Local:
                    </label>
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
