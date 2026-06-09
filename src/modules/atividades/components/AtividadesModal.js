import React, { useState, useEffect } from "react";
import Input from "@/shared/components/utils/Input";
import Select from "@/shared/components/utils/Select";
import MultiSelect from "@/shared/components/utils/MultiSelect";
import SingleSelect from "@/shared/components/utils/SingleSelect";
import Button from "@/shared/components/utils/Button";
import { salaService } from "@/modules/salas/services/sala.service";
import { palestranteService } from "@/modules/palestrantes/services/palestrante.service";
import { atividadeService } from "@/modules/atividades/services/atividade.service";
import { useEventFilter } from "@/shared/contexts/EventFilterContext";

export default function AtividadesModal({ onClickSalvar, onClickCancelar, initialData }) {
    const [nome, setNome] = useState("");
    const [tipo, setTipo] = useState("");
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
    const [atividadesOptions, setAtividadesOptions] = useState([]);
    const [atividadeVinculada, setAtividadeVinculada] = useState(null);

    const { eventoSelect } = useEventFilter();

    useEffect(() => {
        async function fetchData() {
            try {
                const salas = await salaService.getAll();
                setSalasOptions(salas);
                const palestrantesList = await palestranteService.getAll();
                setPalestrantesOptions(palestrantesList);
                const atividadesList = await atividadeService.getAll();
                setAtividadesOptions(atividadesList);
            } catch (error) {
                console.error("Error fetching options:", error);
            }
        }
        fetchData();
    }, []);

    useEffect(() => {
        if (initialData) {
            setNome(initialData.nome);
            setTipo(initialData.tipo || "");
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

            if (initialData.fk_atividade_vinculada) {
                // Find the activity in options if loaded, or just set ID if SingleSelect supports it (it usually expects object)
                // We need to find the object in atividadesOptions
                const linked = atividadesOptions.find(a => a.id_atividade === initialData.fk_atividade_vinculada);
                setAtividadeVinculada(linked || null);
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
            setTipo("");
            setDescricao("");
            setObservacao("");
            setLimite("");
            setSala(null);
            setPalestrantes([]);
            setData("");
            setHora("");
            setDuracao("");
            setAtividadeVinculada(null);
        }
    }, [initialData]);

    const handleSubmit = () => {
        const payload = {
            nome,
            tipo,
            descricao,
            observacao,
            limite: parseInt(limite),
            fk_sala: sala ? sala.id_sala : null,
            fk_evento: eventoSelect?.id_evento,
            fk_atividade_vinculada: atividadeVinculada ? atividadeVinculada.id_atividade : null,
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
                label="Tipo:"
                value={tipo}
                onChange={setTipo}
                placeholder="Tipo da atividade (ex: Palestra, Minicurso)"
                type="text"
            />
            <Input
                label="Descrição:"
                value={descricao}
                onChange={setDescricao}
                placeholder="Descrição e informações da atividade"
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

            <SingleSelect
                label="Atividade Vinculada (Opcional)"
                options={atividadesOptions.filter(a =>
                    (!initialData || a.id_atividade !== initialData.id_atividade) &&
                    (eventoSelect?.id_evento ? a.fk_evento === eventoSelect.id_evento : true)
                )}
                value={atividadeVinculada}
                onChange={setAtividadeVinculada}
                valueKey="id_atividade"
                labelKey="nome"
            />

            <div className="btns w-full flex justify-end mt-4">
                <Button onClick={handleSubmit} label={initialData ? "Atualizar" : "Salvar"} color="success" mode="active" />
                <Button onClick={onClickCancelar} label="Cancelar" color="error" mode="active" />
            </div>
        </div>
    )
}
