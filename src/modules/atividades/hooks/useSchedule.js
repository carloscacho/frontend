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
        atividades.forEach(activity => {
            if (activity.id_atividade === newActivity.id_atividade) return;
            activity.data_atividade?.forEach(session => {
                if (registrations.includes(session.id_data_atividade)) {
                    const sessionDate = session.data.split('T')[0];
                    const startTime = new Date(session.hora).toLocaleTimeString('en-GB');
                    const endTime = new Date(session.duracao).toLocaleTimeString('en-GB');
                    registeredSessions.push({
                        activityName: activity.nome,
                        start: new Date(`${sessionDate}T${startTime}`),
                        end: new Date(`${sessionDate}T${endTime}`)
                    });
                }
            });
        });

        for (const newSession of newActivity.data_atividade) {
            const newSessionDate = newSession.data.split('T')[0];
            const newStartTime = new Date(newSession.hora).toLocaleTimeString('en-GB');
            const newEndTime = new Date(newSession.duracao).toLocaleTimeString('en-GB');
            const newStart = new Date(`${newSessionDate}T${newStartTime}`);
            const newEnd = new Date(`${newSessionDate}T${newEndTime}`);

            for (const registeredSession of registeredSessions) {
                if (newStart < registeredSession.end && newEnd > registeredSession.start) {
                    return registeredSession.activityName;
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
                const conflictName = checkTimeConflict(atividade);
                if (conflictName) {
                    setConflictErrors(prev => ({ ...prev, [atividade.id_atividade]: `Conflito de horário com: ${conflictName}` }));
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
                fetchRegistrations();
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
