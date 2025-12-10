'use client'
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Cookies from 'js-cookie';
import { useAlerta } from '@/context/AlertContext';
import { calculateEndTime } from '@/utils/dateUtils';

export default function ParticipantsPage() {
    const params = useParams();
    const router = useRouter();
    const { activityId, slug } = params;
    const { usuario } = useAuth();
    const { mostrarAlerta } = useAlerta();

    const [atividade, setAtividade] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simple role check redirect
        if (usuario && usuario.tipo !== 1 && usuario.tipo !== 3) {
            router.push(`/${slug}/programacao`);
        }
    }, [usuario, slug, router]);

    const fetchAtividade = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4455';
            const res = await fetch(`${apiUrl}/atividade/${activityId}/participantes`);
            if (res.ok) {
                const data = await res.json();
                setAtividade(data);
            } else {
                mostrarAlerta('error', 'Erro ao carregar atividade');
            }
        } catch (error) {
            console.error('Error fetching activity:', error);
            mostrarAlerta('error', 'Erro de conexão');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activityId) {
            fetchAtividade();
        }
    }, [activityId]);

    const handlePresence = async (dataAtividadeId, participanteId, status) => {
        try {
            const token = Cookies.get('userToken');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4455';

            const res = await fetch(`${apiUrl}/data-atividade-participante/${dataAtividadeId}/${participanteId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    fk_data_atividade: dataAtividadeId,
                    fk_participante: participanteId,
                    presenca: status
                })
            });

            if (res.ok) {
                mostrarAlerta('success', 'Presença atualizada com sucesso');
                // Optimistic update or refetch
                fetchAtividade();
            } else {
                mostrarAlerta('error', 'Erro ao atualizar presença');
            }
        } catch (error) {
            console.error('Error updating presence:', error);
            mostrarAlerta('error', 'Erro de conexão');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (!atividade) {
        return <div className="text-center p-8">Atividade não encontrada</div>;
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <button
                onClick={() => router.back()}
                className="btn btn-outline mb-6"
            >
                ← Voltar
            </button>

            <div className="card bg-base-100 shadow-xl border border-base-200 mb-8">
                <div className="card-body">
                    <h1 className="card-title text-3xl mb-2">{atividade.nome}</h1>
                    <p className="text-gray-600 mb-4">{atividade.descricao}</p>
                    <div className="flex gap-4 text-sm font-bold">
                        <span>Local: {atividade.sala?.nome || 'A definir'}</span>
                    </div>
                </div>
            </div>

            <h2 className="text-2xl font-bold mb-6">Lista de Presença</h2>

            {atividade.data_atividade?.map((session, index) => {
                const date = new Date(session.data);
                const formattedDate = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });
                const startTime = new Date(session.hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
                const endTime = calculateEndTime(session.data, session.hora, session.duracao);

                return (
                    <div key={session.id_data_atividade} className="collapse collapse-arrow bg-base-100 border border-base-200 mb-4">
                        <input type="radio" name="my-accordion-2" defaultChecked={index === 0} />
                        <div className="collapse-title text-xl font-medium flex justify-between items-center">
                            <span>Sessão: {formattedDate} - {startTime} às {endTime}</span>
                            <span className="badge badge-primary">
                                {session.data_atividade_participante?.length || 0} inscritos
                            </span>
                        </div>
                        <div className="collapse-content">
                            <div className="overflow-x-auto">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Nome</th>
                                            <th>Email</th>
                                            <th>Instituição</th>
                                            <th>Status</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {session.data_atividade_participante?.map((inscricao) => (
                                            <tr key={`${inscricao.fk_data_atividade}-${inscricao.fk_participante}`}>
                                                <td>{inscricao.participante.usuario.nome}</td>
                                                <td>{inscricao.participante.usuario.email}</td>
                                                <td>{inscricao.participante.usuario.instituicao}</td>
                                                <td>
                                                    {inscricao.presenca === 1 && <span className="badge badge-success">Presente</span>}
                                                    {inscricao.presenca === 0 && <span className="badge badge-error">Faltou</span>}
                                                    {inscricao.presenca === null && <span className="badge badge-ghost">Pendente</span>}
                                                </td>
                                                <td className="flex gap-2">
                                                    <button
                                                        className={`btn btn-sm ${inscricao.presenca === 1 ? 'btn-success' : 'btn-outline btn-success'}`}
                                                        onClick={() => handlePresence(inscricao.fk_data_atividade, inscricao.fk_participante, 1)}
                                                        title="Marcar Presente"
                                                    >
                                                        P
                                                    </button>
                                                    <button
                                                        className={`btn btn-sm ${inscricao.presenca === 0 ? 'btn-error' : 'btn-outline btn-error'}`}
                                                        onClick={() => handlePresence(inscricao.fk_data_atividade, inscricao.fk_participante, 0)}
                                                        title="Marcar Falta"
                                                    >
                                                        F
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {session.data_atividade_participante?.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="text-center">Nenhum inscrito nesta sessão.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
