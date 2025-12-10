'use client'
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Card from "@/app/_components/displays/Card";
import Input from "@/app/_components/utils/Input";

export default function RegistrationForm() {
    const { setSingupOpen, cadastrar } = useAuth();

    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [cpf, setCpf] = useState('');
    const [senha, setSenha] = useState('');
    const [confSenha, setConfSenha] = useState('');
    const [error, setError] = useState('');

    const preCadastro = async () => {
        setError('');

        if (senha.length < 6) {
            setError('Senha deve ter no minimo seis caracteres');
            return;
        }

        if (senha !== confSenha) {
            setError('Senha e Confirmação de senha são diferentes');
            return;
        }

        // Remove non-digits for length check if needed, but assuming raw input
        if (cpf.length < 11) {
            setError('CPF deve ter no minimo onze caracteres');
            return;
        }

        try {
            await cadastrar({ nome, email, cpf, senha });
            // Success might handle redirect or state change in context/component using this
        } catch (error) {
            setError(error.message || 'Erro ao realizar cadastro');
        }
    };

    return (
        <div className='flex justify-center center-content pt-20'>
            <div className="lg:w-1/4 w-2/3">
                <Card>
                    <div className="flex justify-between">
                        <h2 className="text-4xl font-bold">Cadastro</h2>
                    </div>

                    {error && (
                        <div className="alert alert-error mt-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <div>
                        <Input
                            label="Nome"
                            value={nome}
                            onChange={setNome}
                            type="text"
                            placeholder="Digite seu nome"
                        />
                        <Input
                            label="Email"
                            value={email}
                            onChange={setEmail}
                            type="email"
                            placeholder="Digite seu email"
                        />
                        <Input
                            label="CPF"
                            value={cpf}
                            onChange={setCpf}
                            type="text"
                            placeholder="Digite seu CPF"
                        />
                        <Input
                            label="Senha"
                            value={senha}
                            onChange={setSenha}
                            type="password"
                            placeholder="Digite sua senha"
                        />
                        <Input
                            label="Conf Senha"
                            value={confSenha}
                            onChange={setConfSenha}
                            type="password"
                            placeholder="Digite sua confirmação da senha"
                        />
                    </div>

                    <div className="mt-6">
                        <button onClick={preCadastro} className="btn btn-primary btn-block">Criar</button>
                    </div>
                    <div className="mt-6">
                        <button onClick={() => setSingupOpen(false)} className="btn btn-error btn-block">Voltar</button>
                    </div>
                </Card>
            </div>
        </div>
    );
}

