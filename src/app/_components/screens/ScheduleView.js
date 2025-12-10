'use client'
import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

import Cookies from 'js-cookie';
import { useAlerta } from '@/context/AlertContext';

export default function ScheduleView({ atividades, evento }) {
    const { usuario, setUsuario } = useAuth();
    const { mostrarAlerta } = useAlerta();
    const router = useRouter();

    // Extract unique dates from activities
    const dates = useMemo(() => {
        const allDates = new Set();
        atividades.forEach(atividade => {
            if (atividade.data_atividade && atividade.data_atividade.length > 0) {
                atividade.data_atividade.forEach(da => {
                    const date = new Date(da.data);
                    // Format as DD/MM
                    const formattedDate = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                    allDates.add(formattedDate);
                });
            }
        });
        return Array.from(allDates).sort();
    }, [atividades]);

    const [selectedDate, setSelectedDate] = useState(dates[0]);

    // Filter activities by selected date
    const filteredAtividades = useMemo(() => {
        if (!selectedDate) return [];
        return atividades.filter(atividade => {
            return atividade.data_atividade?.some(da => {
                const date = new Date(da.data);
                const formattedDate = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                return formattedDate === selectedDate;
            });
        });
    }, [atividades, selectedDate]);

    function formatTime(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }

    function formatDateFull(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }

    const [registrations, setRegistrations] = useState([]);
    const [conflictErrors, setConflictErrors] = useState({});

    useEffect(() => {
        if (usuario && usuario.participante?.[0]?.id_participante) {
            fetchRegistrations();
        }
    }, [usuario]);

    const fetchRegistrations = async () => {
        try {
            const participanteId = usuario.participante[0].id_participante;
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4455';
            const token = Cookies.get('userToken');

            const res = await fetch(`${apiUrl}/data-atividade-participante/participante/${participanteId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                setRegistrations(data.map(r => r.fk_data_atividade));
            }
        } catch (error) {
            console.error('Error fetching registrations:', error);
        }
    };

    const isRegistered = (atividade) => {
        if (!atividade.data_atividade) return false;
        // Check if user is registered for any session of this activity
        return atividade.data_atividade.some(da => registrations.includes(da.id_data_atividade));
    };

    const checkTimeConflict = (newActivity) => {
        // 1. Get details of all registered sessions
        const registeredSessions = [];
        atividades.forEach(activity => {
            // Skip the activity itself
            if (activity.id_atividade === newActivity.id_atividade) return;

            activity.data_atividade?.forEach(session => {
                if (registrations.includes(session.id_data_atividade)) {
                    // Combine date and time to create full Date objects
                    const sessionDate = session.data.split('T')[0]; // Extract YYYY-MM-DD
                    const startTime = new Date(session.hora).toLocaleTimeString('en-GB'); // Extract HH:mm:ss
                    const endTime = new Date(session.duracao).toLocaleTimeString('en-GB');

                    registeredSessions.push({
                        activityName: activity.nome,
                        start: new Date(`${sessionDate}T${startTime}`),
                        end: new Date(`${sessionDate}T${endTime}`)
                    });
                }
            });
        });

        // 2. Check for overlaps with new activity sessions
        for (const newSession of newActivity.data_atividade) {
            const newSessionDate = newSession.data.split('T')[0];
            const newStartTime = new Date(newSession.hora).toLocaleTimeString('en-GB');
            const newEndTime = new Date(newSession.duracao).toLocaleTimeString('en-GB');

            const newStart = new Date(`${newSessionDate}T${newStartTime}`);
            const newEnd = new Date(`${newSessionDate}T${newEndTime}`);

            for (const registeredSession of registeredSessions) {
                // Overlap logic: (StartA < EndB) && (EndA > StartB)
                if (newStart < registeredSession.end && newEnd > registeredSession.start) {
                    return registeredSession.activityName;
                }
            }
        }
        return null;
    };

    const handleParticipar = async (atividade) => {
        console.log('handleParticipar called for:', atividade.nome);
        setConflictErrors(prev => ({ ...prev, [atividade.id_atividade]: null }));

        if (!usuario) {
            mostrarAlerta('error', 'Você precisa estar logado.');
            return;
        }

        const token = Cookies.get('userToken');
        if (!token) {
            mostrarAlerta('error', 'Você precisa estar logado.');
            return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4455';
        let participanteId = usuario.participante?.[0]?.id_participante;

        try {
            // 1. Ensure Participant Record Exists
            if (!participanteId) {
                console.log('Participante not found, creating new record...');
                const resPart = await fetch(`${apiUrl}/participante`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ fk_usuario: usuario.id_usuario })
                });

                if (resPart.ok) {
                    const partData = await resPart.json();
                    participanteId = partData.id_participante;

                    // Update local user context and cookie
                    const newParticipante = { ...partData };
                    // Ensure we don't overwrite existing array if it somehow exists but was empty or invalid
                    const currentParticipantes = usuario.participante || [];
                    const newUsuario = { ...usuario, participante: [newParticipante, ...currentParticipantes] };

                    setUsuario(newUsuario);
                    Cookies.set('usuarioData', JSON.stringify(newUsuario), { expires: 7 });
                    console.log('Participante created and user context updated:', participanteId);
                } else {
                    const errData = await resPart.json();
                    throw new Error(errData.message || 'Falha ao criar registro de participante');
                }
            }

            // 2. Ensure Link to Event (Upsert)
            if (evento && evento.id_evento) {
                await fetch(`${apiUrl}/evento-participante`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        fk_evento: evento.id_evento,
                        fk_participante: participanteId
                    })
                });
            }

            // 3. Proceed with Activity Registration
            // 3. Proceed with Activity Registration
            const registered = isRegistered(atividade);

            // Check for conflicts only if we are registering (POST)
            if (!registered) {
                const conflictName = checkTimeConflict(atividade);
                if (conflictName) {
                    setConflictErrors(prev => ({ ...prev, [atividade.id_atividade]: `Conflito de horário com: ${conflictName}` }));
                    return;
                }
            }

            const action = registered ? 'DELETE' : 'POST';

            let successCount = 0;
            let errorCount = 0;

            // Process all sessions
            for (const session of atividade.data_atividade) {
                if (!session.id_data_atividade) {
                    console.error('Session missing id_data_atividade:', session);
                    continue;
                }

                try {
                    let url = `${apiUrl}/data-atividade-participante`;
                    let options = {
                        method: action,
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    };

                    if (action === 'POST') {
                        options.body = JSON.stringify({
                            fk_data_atividade: session.id_data_atividade,
                            fk_participante: participanteId,
                            presenca: 0
                        });
                    } else {
                        url += `/${session.id_data_atividade}/${participanteId}`;
                    }

                    const res = await fetch(url, options);

                    if (res.ok) {
                        successCount++;
                        console.log(`Successfully ${action} session ${session.id_data_atividade}`);
                    } else if (res.status === 409 && action === 'POST') {
                        // Already registered, count as success
                        console.log('Already registered (409), treating as success for session', session.id_data_atividade);
                        successCount++;
                    } else {
                        console.error(`Failed to ${action} session ${session.id_data_atividade}: ${res.status}`);
                        errorCount++;
                    }
                } catch (error) {
                    console.error(error);
                    errorCount++;
                }
            }


            if (successCount > 0) {
                const msg = registered ? 'Inscrição cancelada com sucesso!' : 'Inscrição realizada com sucesso!';
                mostrarAlerta('success', msg);
                fetchRegistrations(); // Refresh registrations
                // Refresh server data (vacancies) without full reload
                router.refresh();
            } else if (errorCount > 0) {
                mostrarAlerta('error', 'Erro ao processar solicitação. Tente novamente.');
            }

        } catch (error) {
            console.error('Error in handleParticipar:', error);
            mostrarAlerta('error', error.message || 'Erro inesperado ao processar inscrição.');
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center mb-8 uppercase text-primary">Programação</h1>

            {!usuario && (
                <div className="alert alert-error mb-8">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <span>Para participar das atividades você deve fazer o login. Clique em Entrar e faça o login.</span>
                </div>
            )}

            {/* Date Tabs */}
            <div className="flex justify-center mb-8 space-x-2 overflow-x-auto">
                {dates.map(date => (
                    <button
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={`btn ${selectedDate === date ? 'btn-primary' : 'btn-outline btn-primary'} rounded-none`}
                    >
                        {date}
                    </button>
                ))}
            </div>

            {/* Activities List */}
            <div className="space-y-6">
                {filteredAtividades.map(atividade => {
                    // Calculate total registered participants across all sessions
                    const totalRegistered = atividade.data_atividade?.reduce((acc, curr) => acc + (curr._count?.data_atividade_participante || 0), 0) || 0;
                    const vacancies = (atividade.limite || 0) - totalRegistered;
                    const speakers = atividade.palestrante_atividade?.map(pa => pa.palestrante) || [];
                    const hasManySpeakers = speakers.length > 5;

                    return (
                        <div
                            key={atividade.id_atividade}
                            className="card bg-base-100 shadow-xl border border-base-200"
                            style={{
                                borderColor: isRegistered(atividade) ? (evento.cor_secundaria || '#3ABFF8') : undefined,
                                borderWidth: isRegistered(atividade) ? '2px' : undefined
                            }}
                        >
                            {/* Card Header */}
                            <div
                                className="text-white p-4 rounded-xl"
                                style={{ backgroundColor: evento.cor_secundaria || '#3ABFF8' }} // Fallback to info color if not set
                            >
                                <div className="flex justify-between items-center">
                                    <h2 className="card-title col-span-10 text-xl font-bold uppercase justify-center text-center">
                                        {atividade.nome}
                                    </h2>
                                    {usuario && (
                                        <div className="card-actions col-span-2 justify-end flex flex-col items-end">
                                            {conflictErrors[atividade.id_atividade] && (
                                                <span className="text-error text-xs font-bold mb-1 text-right bg-white px-2 py-1 rounded">
                                                    {conflictErrors[atividade.id_atividade]}
                                                </span>
                                            )}
                                            <button
                                                className={`btn ${isRegistered(atividade) ? 'btn-error' : 'btn-primary'} btn-lg`}
                                                onClick={() => handleParticipar(atividade)}
                                            >
                                                {isRegistered(atividade) ? 'Cancelar Inscrição' : 'Inscrever-se'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="card-body p-6">
                                <p className="mb-4 text-justify">{atividade.descricao}</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        {atividade.data_atividade?.map((da, index) => (
                                            <div key={index} className="mb-2">
                                                <p><strong>Data:</strong> {formatDateFull(da.data)} - {formatTime(da.hora)} às {da.duracao ? formatTime(da.duracao) : '...'}</p>
                                            </div>
                                        ))}
                                        <p><strong>Local:</strong> {atividade.sala?.nome || 'A definir'}</p>
                                        <p><strong>Vagas:</strong> {vacancies > 0 ? vacancies : 0}</p>
                                        <p><strong>Alunos em lista de Espera:</strong> {vacancies < 0 ? Math.abs(vacancies) : 0}</p>
                                    </div>

                                    <div>
                                        <p className="font-bold mb-1">Ministrado por:</p>
                                        <ul className={`list-none ${hasManySpeakers ? 'grid grid-cols-2 gap-x-4' : ''}`}>
                                            {speakers.map(palestrante => (
                                                <li key={palestrante.id_palestrante} className="mb-1">
                                                    {palestrante.nome}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {filteredAtividades.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        Nenhuma atividade encontrada para esta data.
                    </div>
                )}
            </div>
        </div>
    );
}
