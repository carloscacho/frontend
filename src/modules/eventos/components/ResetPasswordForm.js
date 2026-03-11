'use client';
import { useState } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import Button from '@/shared/components/utils/Button';
import Input from '@/shared/components/utils/Input';
import { usePasswordRecovery } from '@/modules/eventos/hooks/usePasswordRecovery';

export default function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { slug } = useParams();
    const token = searchParams.get('token');

    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');

    const { resetPassword, loading } = usePasswordRecovery(slug);

    const handleReset = async () => {
        await resetPassword(token, novaSenha, confirmarSenha);
    };

    if (!token) {
        return (
            <div className="max-w-md mx-auto py-8 px-4 w-full">
                <div className="alert alert-error">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>Link de recuperação inválido ou ausente.</span>
                </div>
                <div className="mt-4 text-center">
                    <Button onClick={() => router.push(`/${slug}/login`)} mode="outline" color='warning' className="btn-block">
                        Voltar para o Login
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto py-8 px-4 w-full">
            <div className="card bg-base-100 shadow-xl border border-base-200">
                <div className="card-body">
                    <h2 className="card-title justify-center mb-6 text-2xl font-bold uppercase text-primary text-center">
                        Redefinir Senha
                    </h2>
                    <p className="text-center mb-6 text-sm text-base-content/70">
                        Insira sua nova senha abaixo.
                    </p>
                    <div className="mt-4 space-y-4">
                        <Input
                            label="Nova Senha"
                            type="password"
                            placeholder="Digite a nova senha"
                            value={novaSenha}
                            onChange={setNovaSenha}
                        />
                        <Input
                            label="Confirmar Nova Senha"
                            type="password"
                            placeholder="Confirme a nova senha"
                            value={confirmarSenha}
                            onChange={setConfirmarSenha}
                        />
                    </div>
                    <div className="mt-6 flex flex-col gap-3">
                        <Button
                            onClick={handleReset}
                            className="btn-block"
                            mode="primary"
                            disabled={loading}
                        >
                            {loading ? 'Salvando...' : 'Salvar Nova Senha'}
                        </Button>
                        <Button
                            onClick={() => router.push(`/${slug}/login`)}
                            className="btn-block"
                            mode="ghost"
                        >
                            Cancelar
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
