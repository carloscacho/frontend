'use client'
import { useState } from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';
import Card from '@/shared/components/displays/Card';
import { useRouter, useParams } from 'next/navigation';

export default function LoginForm({ redirectPath }) {
    const { login } = useAuth();
    const router = useRouter();
    const { slug } = useParams();
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async () => {
        setError('');
        try {
            await login(email, senha, redirectPath);
        } catch (error) {
            setError(error.message || 'Erro ao fazer login');
        }
    };

    return (
        <div className="max-w-md mx-auto py-8 px-4 w-full">
            <div className="card bg-base-100 shadow-xl border border-base-200">
                <div className="card-body">
                    <h2 className="card-title justify-center mb-6 text-3xl font-bold uppercase text-primary">Login</h2>

                    {error && (
                        <div className="alert alert-error mt-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="mt-4">
                        <div>
                            <label className="label">
                                <span className="label-text">Email</span>
                            </label>
                            <input type="text" placeholder="email" className="input input-bordered w-full"
                                value={email} onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="mt-2">
                            <label className="label">
                                <span className="label-text">Senha</span>
                            </label>
                            <input type="password" placeholder="senha" className="input input-bordered w-full"
                                value={senha} onChange={(e) => setSenha(e.target.value)}
                            />
                            <div className="text-right mt-1">
                                <a href="#" className="link link-hover text-sm text-primary">Esqueci minha senha</a>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <button onClick={handleLogin} className="btn btn-primary btn-block">Entrar</button>
                    </div>

                    <div className="divider my-4">Ainda não está inscrito?</div>

                    <div className="mt-2">
                        <button onClick={() => router.push(`/${slug}/inscricao`)} className="btn btn-secondary btn-outline btn-block">Inscreva-se no Evento</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

