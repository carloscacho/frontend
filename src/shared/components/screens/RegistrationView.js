'use client'
import Cookies from 'js-cookie';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';
import Login from '@/shared/components/screens/Login';
import Cadastro from '@/shared/components/screens/Cadastro';
import { useAlerta } from "@/shared/contexts/AlertContext";
import Input from "@/shared/components/utils/Input";
import { useRouter } from 'next/navigation';

export default function RegistrationView({ evento }) {
    const { usuario, singupOpen, setSingupOpen } = useAuth();
    const { mostrarAlerta } = useAlerta();
    const router = useRouter();

    const [step, setStep] = useState('check_cpf'); // check_cpf, auth
    const [cpfInput, setCpfInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [processingSubscription, setProcessingSubscription] = useState(false);

    // Auto-subscribe when user becomes available (after login/signup)
    useEffect(() => {
        if (usuario && !processingSubscription) {
            handleSubscribe();
        }
    }, [usuario]);

    const handleCheckCpf = async () => {
        if (cpfInput.length < 11) {
            mostrarAlerta('error', 'CPF inválido. Digite apenas números.');
            return;
        }

        setLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4455';
            const res = await fetch(`${apiUrl}/usuario/teste-cpf`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cpf: cpfInput })
            });

            const data = await res.json();

            // CPF was entered, proceed with auth flow

            if (data.status === 'warning') {
                // CPF exists -> Go to Login
                mostrarAlerta('info', 'CPF encontrado. Faça login para continuar.');
                setSingupOpen(false);
                setStep('auth');
            } else {
                // CPF does not exist -> Go to Signup
                mostrarAlerta('info', 'CPF não cadastrado. Preencha o formulário para se cadastrar.');
                setSingupOpen(true);
                setStep('auth');
            }
        } catch (error) {
            console.error(error);
            mostrarAlerta('error', 'Erro ao verificar CPF.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async () => {
        if (!usuario) return;
        setProcessingSubscription(true);

        const userCookies = Cookies.get('usuarioData');
        const { token } = JSON.parse(userCookies);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4455';
            const res = await fetch(`${apiUrl}/evento-participante`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    fk_evento: evento.id_evento,
                    fk_participante: usuario.participante?.[0]?.id_participante || usuario.id_usuario // Fallback if structure differs
                })
            });

            if (res.ok) {
                mostrarAlerta('success', 'Inscrição realizada com sucesso! Redirecionando...');
                setTimeout(() => {
                    router.push(`/${evento.slug}/programacao`);
                }, 1500);
            } else {
                const errorData = await res.json();
                // If already registered, also redirect
                if (errorData.message && errorData.message.includes('Unique constraint failed')) {
                    mostrarAlerta('info', 'Você já está inscrito neste evento. Redirecionando...');
                    setTimeout(() => {
                        router.push(`/${evento.slug}/programacao`);
                    }, 1500);
                } else {
                    mostrarAlerta('error', errorData.message || 'Erro ao realizar inscrição.');
                    setProcessingSubscription(false); // Allow retry
                }
            }
        } catch (error) {
            console.error(error);
            mostrarAlerta('error', 'Erro de conexão.');
            setProcessingSubscription(false);
        }
    };

    if (step === 'check_cpf' && !usuario) {
        return (
            <div className="max-w-md mx-auto py-8 px-4">
                <h1 className="text-3xl font-bold text-center mb-8 uppercase text-primary">Inscrição - {evento.nome}</h1>
                <div className="card bg-base-100 shadow-xl border border-base-200">
                    <div className="card-body">
                        <h2 className="card-title justify-center mb-4">Verificação de Cadastro</h2>
                        <p className="text-center mb-4">Informe seu CPF para iniciar a inscrição.</p>

                        <Input
                            label="CPF"
                            value={cpfInput}
                            onChange={setCpfInput}
                            type="text"
                            placeholder="Digite seu CPF (somente números)"
                        />

                        <div className="mt-6">
                            <button
                                onClick={handleCheckCpf}
                                className="btn btn-primary btn-block"
                                disabled={loading}
                            >
                                {loading ? <span className="loading loading-spinner"></span> : 'Verificar'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center mb-8 uppercase text-primary">Inscrição - {evento.nome}</h1>

            {usuario && processingSubscription ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                    <p className="mt-4 text-lg">Processando sua inscrição...</p>
                </div>
            ) : (
                <>
                    {singupOpen ? <Cadastro /> : <Login />}
                </>
            )}
        </div>
    );
}
