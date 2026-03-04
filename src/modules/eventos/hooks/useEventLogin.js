import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useAlerta } from '@/shared/contexts/AlertContext';
import Cookies from 'js-cookie';
import { eventoService } from '@/modules/eventos/services/evento.service';
import { inscricaoService } from '@/modules/inscricoes/services/inscricao.service';

export function useEventLogin(slug) {
    const { usuario } = useAuth();
    const { mostrarAlerta } = useAlerta();
    const router = useRouter();

    const [evento, setEvento] = useState(null);
    const [loading, setLoading] = useState(true);
    const [subscribing, setSubscribing] = useState(false);
    const hasAttemptedSubscription = useRef(false);

    // Fetch event data
    useEffect(() => {
        const fetchEvento = async () => {
            try {
                const data = await eventoService.getBySlug(slug);
                setEvento(data);
            } catch (error) {
                console.error('Error fetching event:', error);
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchEvento();
        }
    }, [slug]);

    // Auto-subscribe and redirect when user logs in
    useEffect(() => {
        const handleSubscription = async () => {
            if (usuario && evento && !hasAttemptedSubscription.current) {
                hasAttemptedSubscription.current = true;
                setSubscribing(true);

                try {
                    let participanteId = usuario.participante?.[0]?.id_participante;

                    if (!participanteId) {
                        try {
                            const partData = await inscricaoService.ensureParticipant(usuario);
                            participanteId = partData.id_participante;
                        } catch (err) {
                            mostrarAlerta('error', 'Erro ao processar inscrição. Entre em contato com o suporte.');
                            setSubscribing(false);
                            return;
                        }
                    }

                    try {
                        await inscricaoService.linkParticipantToEvent(evento.id_evento, participanteId);
                        mostrarAlerta('success', 'Inscrição realizada com sucesso!');
                        setTimeout(() => {
                            router.push(`/${slug}/programacao`);
                        }, 1000);
                    } catch (error) {
                        const errorMessage = error.response?.data?.message || '';
                        if (errorMessage.includes('Unique constraint') || error.response?.status === 409) {
                            mostrarAlerta('info', 'Você já está inscrito neste evento.');
                            setTimeout(() => {
                                router.push(`/${slug}/programacao`);
                            }, 1000);
                        } else {
                            mostrarAlerta('error', errorMessage || 'Erro ao realizar inscrição.');
                            setSubscribing(false);
                        }
                    }
                } catch (error) {
                    console.error('Subscription error:', error);
                    mostrarAlerta('error', 'Erro de conexão ao processar inscrição.');
                    setSubscribing(false);
                }
            }
        };

        handleSubscription();
    }, [usuario, evento, slug, router, mostrarAlerta]);

    return { evento, loading, subscribing };
}
