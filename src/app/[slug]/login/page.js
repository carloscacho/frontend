'use client'
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Login from '@/app/_components/screens/Login';
import Cadastro from '@/app/_components/screens/Cadastro';
import { useAlerta } from '@/context/AlertContext';

export default function EventLoginPage() {
    const { usuario, singupOpen } = useAuth();
    const { mostrarAlerta } = useAlerta();
    const router = useRouter();
    const params = useParams();
    const slug = params.slug;

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

        fetchEvento();
    }, [slug]);

    // Auto-subscribe and redirect when user logs in
    useEffect(() => {
        const handleSubscription = async () => {
            if (usuario && evento && !hasAttemptedSubscription.current) {
                hasAttemptedSubscription.current = true;
                setSubscribing(true);

                try {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4455';

                    const participanteId = usuario.participante?.[0]?.id_participante;

                    if (!participanteId) {
                        mostrarAlerta('error', 'Erro ao processar inscrição. Entre em contato com o suporte.');
                        setSubscribing(false);
                        return;
                    }

                    // Create evento_participante link
                    const res = await fetch(`${apiUrl}/evento-participante`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
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
                        if (errorData.message?.includes('Unique constraint')) {
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
    }, [usuario, evento]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-200">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (!evento) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-200">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Evento não encontrado</h1>
                    <button onClick={() => router.push('/')} className="btn btn-primary">
                        Voltar para Home
                    </button>
                </div>
            </div>
        );
    }

    if (subscribing) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-200">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                    <p className="mt-4 text-lg">Processando sua inscrição...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-200">
            <div className="pt-8 pb-4 text-center">
                <h1 className="text-3xl font-bold uppercase text-primary mb-2">
                    {evento.nome}
                </h1>
                <p className="text-lg">Faça login para se inscrever no evento</p>
            </div>
            {singupOpen ? <Cadastro /> : <Login redirectPath={`/${slug}/login`} />}
        </div>
    );
}
