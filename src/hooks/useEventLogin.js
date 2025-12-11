import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useAlerta } from '@/context/AlertContext';
import Cookies from 'js-cookie';

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
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4455';
                const res = await fetch(`${apiUrl}/evento/slug/${slug}`);
                if (res.ok) {
                    const data = await res.json();
                    setEvento(data);
                }
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
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4455';

                    // Ensure we have the latest token
                    const userCookies =  Cookies.get('usuarioData');
                    const {token} = JSON.parse(userCookies);

                    let participanteId = usuario.participante?.[0]?.id_participante;

                    // If for some reason participant ID is missing but user exists, try to fetch or create?
                    // The original code assumed it exists or failed. 
                    // Ideally, we should unify this logic with registrationService but strict refactor first.

                    if (!participanteId) {
                        // Try to create participant if missing (Common issue if user created via other means)
                        const resPart = await fetch(`${apiUrl}/participante`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${userCookies.token}`
                            },
                            body: JSON.stringify({ fk_usuario: usuario.id_usuario })
                        });

                        if (resPart.ok) {
                            const partData = await resPart.json();
                            participanteId = partData.id_participante;
                        } else {
                            mostrarAlerta('error', 'Erro ao processar inscrição. Entre em contato com o suporte.');
                            setSubscribing(false);
                            return;
                        }
                    }

                    // Create evento_participante link
                    const res = await fetch(`${apiUrl}/evento-participante`, {
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

                    if (res.ok) {
                        mostrarAlerta('success', 'Inscrição realizada com sucesso!');
                        setTimeout(() => {
                            router.push(`/${slug}/programacao`);
                        }, 1000);
                    } else {
                        const errorData = await res.json();
                        // If already registered, just redirect
                        if (errorData.message?.includes('Unique constraint') || res.status === 409) {
                            mostrarAlerta('info', 'Você já está inscrito neste evento.');
                            setTimeout(() => {
                                router.push(`/${slug}/programacao`);
                            }, 1000);
                        } else {
                            mostrarAlerta('error', errorData.message || 'Erro ao realizar inscrição.');
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
