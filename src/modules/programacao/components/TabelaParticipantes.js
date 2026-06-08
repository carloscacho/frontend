import React from 'react';
import Button from '@/shared/components/utils/Button';
import { calculateEndTime } from '@/shared/utils/dateUtils';

export default function TabelaParticipantes({ atividade, handlePresence }) {
    return (
        <>
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
                                                    <Button
                                                        mode="" color=""
                                                        className={`btn-sm m-0 ${inscricao.presenca === 1 ? 'btn-success' : 'btn-outline btn-success'}`}
                                                        onClick={() => handlePresence(inscricao.fk_data_atividade, inscricao.fk_participante, 1)}
                                                        title="Marcar Presente"
                                                    >
                                                        P
                                                    </Button>
                                                    <Button
                                                        mode="" color=""
                                                        className={`btn-sm m-0 ${inscricao.presenca === 0 ? 'btn-error' : 'btn-outline btn-error'}`}
                                                        onClick={() => handlePresence(inscricao.fk_data_atividade, inscricao.fk_participante, 0)}
                                                        title="Marcar Falta"
                                                    >
                                                        F
                                                    </Button>
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
        </>
    );
}
