import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useAlerta } from '@/shared/contexts/AlertContext';
import { inscricaoService } from '@/modules/inscricoes/services/inscricao.service';
import Cookies from 'js-cookie';

export function useSchedule(atividades, evento) {
    const { usuario, setUsuario } = useAuth();
    const { mostrarAlerta } = useAlerta();

    // Date Logic
    const dates = useMemo(() => {
        const allDates = new Set();
        atividades.forEach(atividade => {
            if (atividade.data_atividade && atividade.data_atividade.length > 0) {
                atividade.data_atividade.forEach(da => {
                    const date = new Date(da.data);
                    const formattedDate = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });
                    allDates.add(formattedDate);
                });
            }
        });
        return Array.from(allDates).sort();
    }, [atividades]);

    const [selectedDate, setSelectedDate] = useState(null);
    const [initialHashChecked, setInitialHashChecked] = useState(false);

    useEffect(() => {
        if (dates.length > 0 && !initialHashChecked) {
            const hash = typeof window !== 'undefined' ? window.location.hash : '';

            if (hash && hash.startsWith('#atividade-')) {
                const activityIdFromHash = parseInt(hash.replace('#atividade-', ''), 10);
                const targetActivity = atividades.find(a => a.id_atividade === activityIdFromHash);

                if (targetActivity && targetActivity.data_atividade?.length > 0) {
                    const date = new Date(targetActivity.data_atividade[0].data);
                    const formattedDate = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });
                    if (dates.includes(formattedDate)) {
                        setSelectedDate(formattedDate);
                        setInitialHashChecked(true);
                        return;
                    }
                }
            }

            setSelectedDate(dates[0]);
            setInitialHashChecked(true);
        }
    }, [dates, atividades, initialHashChecked]);

    const filteredAtividades = useMemo(() => {
        if (!selectedDate) return [];
        return atividades.filter(atividade => {
            return atividade.data_atividade?.some(da => {
                const date = new Date(da.data);
                const formattedDate = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });
                return formattedDate === selectedDate;
            });
        });
    }, [atividades, selectedDate]);

    // Registration Logic
    const [registrations, setRegistrations] = useState([]);
    const [conflictErrors, setConflictErrors] = useState({});

    const fetchRegistrations = useCallback(async () => {
        if (!usuario || !usuario.participante?.[0]?.id_participante) return;
        try {
            const data = await inscricaoService.fetchParticipantActivities(usuario.participante[0].id_participante);
            setRegistrations(data.map(r => r.fk_data_atividade));
        } catch (error) {
            console.error('Error fetching registrations:', error);
        }
    }, [usuario]);

    useEffect(() => {
        fetchRegistrations();
    }, [fetchRegistrations]);

    const isRegistered = useCallback((atividade) => {
        if (!atividade.data_atividade) return false;
        return atividade.data_atividade.some(da => registrations.includes(da.id_data_atividade));
    }, [registrations]);

    const checkTimeConflict = useCallback((newActivity) => {
        const registeredSessions = [];

        /**
         * Calculates the end time in total UTC minutes since midnight.
         * duracao stores the duration (e.g. "1970-01-01T05:00:00Z" = 5 hours),
         * NOT the end time. End = start + duration.
         */
        const getStartAndEndMinutes = (session) => {
            const horaDate = new Date(session.hora);
            const startMinutes = horaDate.getUTCHours() * 60 + horaDate.getUTCMinutes();

            const duracaoDate = new Date(session.duracao);
            const durationMinutes = duracaoDate.getUTCHours() * 60 + duracaoDate.getUTCMinutes();

            const endMinutes = startMinutes + durationMinutes;
            return { startMinutes, endMinutes };
        };

        const buildUTCDate = (sessionDate, totalMinutes) => {
            const hours = Math.floor(totalMinutes / 60) % 24;
            const minutes = totalMinutes % 60;
            const hh = String(hours).padStart(2, '0');
            const mm = String(minutes).padStart(2, '0');
            return new Date(`${sessionDate}T${hh}:${mm}:00Z`);
        };

        atividades.forEach(activity => {
            if (activity.id_atividade === newActivity.id_atividade) return;
            activity.data_atividade?.forEach(session => {
                if (registrations.includes(session.id_data_atividade)) {
                    const sessionDate = session.data.split('T')[0];
                    const { startMinutes, endMinutes } = getStartAndEndMinutes(session);
                    registeredSessions.push({
                        activityName: activity.nome,
                        activityId: activity.id_atividade,
                        start: buildUTCDate(sessionDate, startMinutes),
                        end: buildUTCDate(sessionDate, endMinutes)
                    });
                }
            });
        });

        for (const newSession of newActivity.data_atividade) {
            const newSessionDate = newSession.data.split('T')[0];
            const { startMinutes, endMinutes } = getStartAndEndMinutes(newSession);
            const newStart = buildUTCDate(newSessionDate, startMinutes);
            const newEnd = buildUTCDate(newSessionDate, endMinutes);

            for (const registeredSession of registeredSessions) {
                // Overlap: starts before the other ends AND ends after the other starts
                // Adjacent sessions (one ends exactly when the other starts) are allowed
                const overlaps = newStart.getTime() < registeredSession.end.getTime()
                    && newEnd.getTime() > registeredSession.start.getTime();

                const isAdjacent = newEnd.getTime() === registeredSession.start.getTime()
                    || newStart.getTime() === registeredSession.end.getTime();

                if (overlaps && !isAdjacent) {
                    return { name: registeredSession.activityName, id: registeredSession.activityId };
                }
            }
        }
        return null;
    }, [atividades, registrations]);

    const handleParticipar = async (atividade) => {
        setConflictErrors(prev => ({ ...prev, [atividade.id_atividade]: null }));

        if (!usuario) {
            mostrarAlerta('error', 'Você precisa estar logado.');
            return;
        }

        let participanteId = usuario.participante?.[0]?.id_participante;
        const registered = isRegistered(atividade);

        try {
            if (!participanteId) {
                const partData = await inscricaoService.ensureParticipant(usuario);
                participanteId = partData.id_participante;
                const newUsuario = { ...usuario, participante: [partData, ...(usuario.participante || [])] };
                setUsuario(newUsuario);
                Cookies.set('usuarioData', JSON.stringify(newUsuario), { expires: 5 });
            }

            if (evento && evento.id_evento) {
                await inscricaoService.linkParticipantToEvent(evento.id_evento, participanteId);
            }

            if (!registered) {
                const conflict = checkTimeConflict(atividade);
                if (conflict) {
                    setConflictErrors(prev => ({ 
                        ...prev, 
                        [atividade.id_atividade]: (
                            <span>
                                Conflito de horário com a atividade:{' '}
                                <a 
                                    href={`#atividade-${conflict.id}`}
                                    className="underline hover:text-red-900"
                                >
                                    {conflict.name}
                                </a>
                            </span>
                        )
                    }));
                    return;
                }
            }

            const action = registered ? 'DELETE' : 'POST';
            let successCount = 0;
            let errorCount = 0;

            for (const session of atividade.data_atividade) {
                if (!session.id_data_atividade) continue;
                try {
                    const res = await inscricaoService.manageActivityRegistration(action, session, participanteId);
                    if (res.ok || (res.status === 409 && action === 'POST')) {
                        successCount++;
                    } else {
                        errorCount++;
                    }
                } catch (err) {
                    console.error(err);
                    errorCount++;
                }
            }

            if (successCount > 0) {
                const msg = registered ? 'Inscrição cancelada com sucesso!' : 'Inscrição realizada com sucesso!';
                mostrarAlerta('success', msg);
                await fetchRegistrations();
                return true; // Signal success
            } else if (errorCount > 0) {
                mostrarAlerta('error', 'Erro ao processar solicitação. Tente novamente.');
            }
        } catch (error) {
            console.error('Error in handleParticipar:', error);
            mostrarAlerta('error', error.message || 'Erro inesperado ao processar inscrição.');
        }
        return false;
    };

    return {
        dates,
        selectedDate,
        setSelectedDate,
        filteredAtividades,
        isRegistered,
        handleParticipar,
        conflictErrors,
        usuario
    };
}
