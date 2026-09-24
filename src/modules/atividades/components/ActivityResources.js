import React, { useState, useEffect } from 'react';
import { PiFilesDuotone, PiLockKeyDuotone, PiDownloadSimpleDuotone, PiLinkDuotone } from 'react-icons/pi';
import API from '@/lib/api/axios-instance';
import { useAlerta } from '@/shared/contexts/AlertContext';

export default function ActivityResources({ idAtividade, isRegistered, isAviso }) {
    const [recursos, setRecursos] = useState([]);
    const [loading, setLoading] = useState(false);
    const { mostrarAlerta } = useAlerta();

    useEffect(() => {
        if (isRegistered && !isAviso) {
            fetchRecursos();
        }
    }, [isRegistered, isAviso, idAtividade]);

    const fetchRecursos = async () => {
        setLoading(true);
        try {
            const response = await API.get(`/recurso-atividade/participante/${idAtividade}`);
            setRecursos(response.data);
        } catch (error) {
            if (error.response?.status !== 403) {
                mostrarAlerta('error', "Erro ao carregar os recursos da atividade.");
            }
        } finally {
            setLoading(false);
        }
    };

    if (isAviso) return null;

    return (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="flex items-center gap-2 text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
                <PiFilesDuotone className="w-5 h-5 text-primary" /> Recursos da Atividade
            </h4>

            {!isRegistered ? (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg text-sm text-gray-500">
                    <PiLockKeyDuotone className="w-6 h-6 text-gray-400" />
                    <span>Inscreva-se na atividade para ter acesso aos materiais e links exclusivos disponibilizados pelo organizador.</span>
                </div>
            ) : loading ? (
                <div className="flex justify-center p-4">
                    <span className="loading loading-spinner loading-sm text-primary"></span>
                </div>
            ) : recursos.length === 0 ? (
                <div className="text-sm text-gray-500 italic">Nenhum recurso disponível no momento.</div>
            ) : (
                <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                    {recursos.map(r => (
                        <a
                            key={r.id_recurso}
                            href={r.url_arquivo.startsWith('http') ? r.url_arquivo : `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${r.url_arquivo}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 border border-gray-200 dark:border-zinc-700 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors group"
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:scale-110 transition-transform">
                                    {r.tipo_envio === 'LINK' ? <PiLinkDuotone className="w-5 h-5" /> : <PiDownloadSimpleDuotone className="w-5 h-5" />}
                                </div>
                                <div className="flex flex-col truncate">
                                    <span className="font-medium text-sm text-gray-800 dark:text-gray-200 truncate">{r.nome}</span>
                                    {r.formato && <span className="text-xs text-gray-500">{r.formato}</span>}
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}
