import React, { useState, useEffect } from "react";
import Input from "@/shared/components/utils/Input";
import Select from "@/shared/components/utils/Select";
import Button from "@/shared/components/utils/Button";
import { useAlerta } from "@/shared/contexts/AlertContext";
import API from "@/lib/api/axios-instance";

export default function RecursosAtividade({ idAtividade }) {
    const [recursos, setRecursos] = useState([]);
    const [tipoEnvio, setTipoEnvio] = useState("LINK");
    const [nome, setNome] = useState("");
    const [urlArquivo, setUrlArquivo] = useState("");
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const { mostrarAlerta } = useAlerta();

    useEffect(() => {
        if (idAtividade) {
            fetchRecursos();
        }
    }, [idAtividade]);

    const fetchRecursos = async () => {
        try {
            const response = await API.get(`/recurso-atividade/admin/${idAtividade}`);
            setRecursos(response.data);
        } catch (error) {
            mostrarAlerta('error', "Erro ao carregar recursos da atividade");
        }
    };

    const handleUpload = async () => {
        if (!nome) return mostrarAlerta('warning', "Preencha o nome do recurso");
        
        setLoading(true);
        try {
            if (tipoEnvio === "LINK") {
                if (!urlArquivo) {
                    setLoading(false);
                    return mostrarAlerta('warning', "Preencha a URL do link");
                }
                await API.post(`/recurso-atividade/link`, {
                    nome,
                    tipo_envio: "LINK",
                    url_arquivo: urlArquivo,
                    fk_atividade: idAtividade
                });
            } else {
                if (!file) {
                    setLoading(false);
                    return mostrarAlerta('warning', "Selecione um arquivo para upload");
                }
                const formData = new FormData();
                formData.append("nome", nome);
                formData.append("tipo_envio", "UPLOAD");
                formData.append("fk_atividade", idAtividade);
                formData.append("file", file);

                await API.post(`/recurso-atividade/upload`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }
            mostrarAlerta('success', "Recurso adicionado com sucesso!");
            setNome("");
            setUrlArquivo("");
            setFile(null);
            fetchRecursos();
        } catch (error) {
            mostrarAlerta('error', "Erro ao adicionar recurso");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (idRecurso) => {
        if (!window.confirm("Tem certeza que deseja remover este recurso?")) return;
        try {
            await API.delete(`/recurso-atividade/${idRecurso}`);
            mostrarAlerta('success', "Recurso removido com sucesso!");
            fetchRecursos();
        } catch (error) {
            mostrarAlerta('error', "Erro ao remover recurso");
        }
    };

    return (
        <div className="w-full mt-6 border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Recursos da Atividade (Opcional)</h3>
            <p className="text-sm text-gray-500 mb-4">Adicione arquivos ou links que ficarão disponíveis para os participantes inscritos (ex: Slides, PDF, link do YouTube).</p>
            
            <div className="flex flex-col gap-2 p-4 border rounded bg-gray-50 dark:bg-zinc-800">
                <div className="flex gap-2">
                    <div className="w-1/3">
                        <Select 
                            label="Tipo de Recurso"
                            value={tipoEnvio}
                            onChange={(e) => setTipoEnvio(e.target.value)}
                        >
                            <option value="LINK">Link Externo</option>
                            <option value="UPLOAD">Upload de Arquivo</option>
                        </Select>
                    </div>
                    <div className="w-2/3">
                        <Input
                            label="Nome do Recurso:"
                            value={nome}
                            onChange={setNome}
                            placeholder="Ex: Slides da Palestra"
                            type="text"
                        />
                    </div>
                </div>

                {tipoEnvio === "LINK" ? (
                    <Input
                        label="URL do Link:"
                        value={urlArquivo}
                        onChange={setUrlArquivo}
                        placeholder="https://..."
                        type="url"
                    />
                ) : (
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Arquivo (PDF, ZIP, etc):</label>
                        <input
                            type="file"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="p-2 border rounded text-sm w-full bg-white dark:bg-zinc-900"
                        />
                    </div>
                )}
                
                <div className="flex justify-end mt-2">
                    <Button onClick={handleUpload} label={loading ? "Enviando..." : "Adicionar Recurso"} color="primary" mode="active" />
                </div>
            </div>

            {recursos.length > 0 && (
                <div className="mt-4">
                    <h4 className="text-md font-medium mb-2">Recursos Adicionados</h4>
                    <ul className="flex flex-col gap-2">
                        {recursos.map(r => (
                            <li key={r.id_recurso} className="flex justify-between items-center p-2 bg-white dark:bg-zinc-900 border rounded shadow-sm">
                                <div>
                                    <span className="font-semibold">{r.nome}</span>
                                    <span className="text-xs ml-2 px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">{r.tipo_envio} {r.formato ? `(${r.formato})` : ''}</span>
                                </div>
                                <div className="flex gap-2">
                                    <a href={r.url_arquivo.startsWith('http') ? r.url_arquivo : `http://localhost:3000${r.url_arquivo}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-sm flex items-center">Visualizar</a>
                                    <button onClick={() => handleDelete(r.id_recurso)} className="text-red-500 hover:text-red-700 text-sm">Remover</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
