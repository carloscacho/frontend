'use client'
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Cookies from 'js-cookie';
import { useAlerta } from '@/context/AlertContext';
import { calculateEndTime } from '@/utils/dateUtils';
import { printAttendanceList, printActivityReport } from '@/utils/printUtils';
import { PiPrinter, PiFileText, PiUserPlus } from 'react-icons/pi';
import InscricaoParticipanteModal from '@/app/_components/Modais/InscricaoParticipanteModal';

export default function ParticipantsPage() {
    const params = useParams();
    const router = useRouter();
    const { activityId, slug } = params;
    const { usuario } = useAuth();
    const { mostrarAlerta } = useAlerta();

    const [atividade, setAtividade] = useState(null);
    const [loading, setLoading] = useState(true);
    const inscricaoModalRef = useRef(null);

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
            const userCookies = Cookies.get('usuarioData');
            const { token } = JSON.parse(userCookies);
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
                fetchAtividade();
            } else {
                mostrarAlerta('error', 'Erro ao atualizar presença');
            }
        } catch (error) {
            console.error('Error updating presence:', error);
            mostrarAlerta('error', 'Erro de conexão');
        }
    };

    // Collect all unique participants across all sessions
    const getAllParticipants = () => {
        if (!atividade?.data_atividade) return [];
        const map = new Map();
        atividade.data_atividade.forEach(session => {
            session.data_atividade_participante?.forEach(inscricao => {
                const p = inscricao.participante;
                if (!map.has(p.id_participante)) {
                    map.set(p.id_participante, {
                        nome: p.usuario.nome,
                        email: p.usuario.email,
                        instituicao: p.usuario.instituicao || '',
                    });
                }
            });
        });
        return Array.from(map.values()).sort((a, b) => a.nome.localeCompare(b.nome));
    };

    const handlePrintAttendanceList = () => {
        printAttendanceList({
            title: atividade?.nome || 'Atividade',
            subtitle: atividade?.sala?.nome,
            participants: getAllParticipants(),
        });
    };

    const handlePrintReport = () => {
        printActivityReport({ atividade, calculateEndTime });
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
            <div className="flex flex-wrap items-center gap-3 mb-6">
                <button
                    onClick={() => router.back()}
                    className="btn btn-outline"
                >
                    ← Voltar
                </button>

                <div className="flex-1"></div>

                <button
                    onClick={handlePrintAttendanceList}
                    className="btn btn-secondary btn-sm gap-2 print:hidden"
                    title="Imprimir Lista de Presença (PDF)"
                >
                    <PiPrinter size={18} />
                    Lista de Presença
                </button>
                <button
                    onClick={handlePrintReport}
                    className="btn btn-info btn-sm gap-2 print:hidden"
                    title="Imprimir Relatório"
                >
                    <PiFileText size={18} />
                    Relatório
                </button>
                <button
                    onClick={() => inscricaoModalRef.current?.showModal()}
                    className="btn btn-primary btn-sm gap-2 print:hidden"
                    title="Inscrever Participante"
                >
                    <PiUserPlus size={18} />
                    Inscrever
                </button>
            </div>

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
                                            <th className="hidden md:table-cell">Email</th>
                                            <th className="hidden md:table-cell">Instituição</th>
                                            <th>Status</th>
                                            <th className="print:hidden">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {session.data_atividade_participante?.map((inscricao) => (
                                            <tr key={`${inscricao.fk_data_atividade}-${inscricao.fk_participante}`}>
                                                <td>{inscricao.participante.usuario.nome}</td>
                                                <td className="hidden md:table-cell">{inscricao.participante.usuario.email}</td>
                                                <td className="hidden md:table-cell">{inscricao.participante.usuario.instituicao}</td>
                                                <td>
                                                    {inscricao.presenca === 1 && <span className="badge badge-success">Presente</span>}
                                                    {inscricao.presenca === 0 && <span className="badge badge-error">Faltou</span>}
                                                    {inscricao.presenca === null && <span className="badge badge-ghost">Pendente</span>}
                                                </td>
                                                <td className="flex gap-2 print:hidden">
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

            {/* Enrollment Modal */}
            <InscricaoParticipanteModal
                refModal={inscricaoModalRef}
                activityId={activityId}
                onSuccess={() => {
                    mostrarAlerta('success', 'Participantes inscritos com sucesso');
                    fetchAtividade();
                }}
            />
        </div>
    );
}
