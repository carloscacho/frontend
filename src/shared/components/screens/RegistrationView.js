'use client'
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useAlerta } from "@/shared/contexts/AlertContext";
import Input from "@/shared/components/utils/Input";
import Button from "@/shared/components/utils/Button";
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/shared/components/displays/LoadingSpinner';
import { usuarioService } from '@/modules/usuarios/services/usuario.service';

export default function RegistrationView({ evento }) {
    const { usuario, setSingupOpen } = useAuth();
    const { mostrarAlerta } = useAlerta();
    const router = useRouter();

    const [step, setStep] = useState('check_cpf'); // check_cpf, registration_form
    const [cpfInput, setCpfInput] = useState('');
    const [loading, setLoading] = useState(false);

    // Form fields
    const [userData, setUserData] = useState({
        nome: '', email: '', cpf: '',
        senha: '', confSenha: '', senhaAtual: '',
        vinculo: 1, ra: '', siape: '', instituicao: ''
    });
    const [isExistingUser, setIsExistingUser] = useState(false);

    const formatCPF = (value) => {
        const cleaned = value.replace(/\D/g, '');
        let formatted = cleaned;
        if (cleaned.length > 3) {
            formatted = cleaned.replace(/^(\d{3})(\d)/, '$1.$2');
        }
        if (cleaned.length > 6) {
            formatted = formatted.replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
        }
        if (cleaned.length > 9) {
            formatted = formatted.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
        }
        return formatted.slice(0, 14);
    };

    const handleCpfChange = (val) => {
        setCpfInput(formatCPF(val));
    };

    const handleCheckCpf = async () => {
        const unmaskedCpf = cpfInput.replace(/\D/g, '');

        if (unmaskedCpf.length < 11) {
            mostrarAlerta('error', 'CPF inválido. Digite 11 números.');
            return;
        }

        setLoading(true);
        try {
            const data = await usuarioService.checkRegistration(unmaskedCpf, evento.id_evento);

            if (data.status === 'already_registered') {
                mostrarAlerta('info', 'Você já está inscrito neste evento.');
                router.push(`/${evento.slug}/login`);
            } else if (data.status === 'exists_not_registered') {
                mostrarAlerta('info', 'Encontramos seu cadastro! Confirme seus dados para continuar.');
                setIsExistingUser(true);
                setUserData({
                    ...userData,
                    ...data.user,
                    cpf: cpfInput,
                    vinculo: data.user.vinculo || 1,
                    ra: data.user.ra || '',
                    siape: data.user.siape || '',
                    instituicao: data.user.instituicao || '',
                });
                setStep('registration_form');
            } else {
                mostrarAlerta('info', 'CPF não cadastrado. Preencha o formulário para se cadastrar e inscrever.');
                setIsExistingUser(false);
                setUserData({
                    nome: '', email: '',
                    senha: '', confSenha: '', senhaAtual: '',
                    vinculo: 1, ra: '', siape: '', instituicao: '',
                    cpf: cpfInput
                });
                setStep('registration_form');
            }
        } catch (error) {
            console.error(error);
            mostrarAlerta('error', 'Erro ao verificar CPF.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterAndSubscribe = async () => {
        // Validation
        if (!userData.nome || !userData.email) {
            mostrarAlerta('error', 'Preencha todos os campos obrigatórios.');
            return;
        }
        if (isExistingUser && !userData.senhaAtual) {
            mostrarAlerta('error', 'Insira sua senha atual para confirmar a atualização de dados.');
            return;
        }
        if (!isExistingUser) {
            if (userData.senha.length < 6) return mostrarAlerta('error', 'A senha deve ter no mínimo 6 caracteres.');
            if (userData.senha !== userData.confSenha) return mostrarAlerta('error', 'A senha e a confirmação não conferem.');
        }

        setLoading(true);
        try {
            const payload = {
                nome: userData.nome,
                email: userData.email,
                cpf: userData.cpf.replace(/\D/g, ''),
                senha: userData.senha || undefined,
                senhaAtual: userData.senhaAtual || undefined,
                vinculo: Number(userData.vinculo),
                ra: userData.vinculo == 1 && userData.ra ? Number(userData.ra) : undefined,
                siape: userData.vinculo == 2 && userData.siape ? userData.siape : undefined,
                instituicao: userData.instituicao || undefined,
                id_evento: evento.id_evento,
            };

            await usuarioService.registerAndSubscribe(payload);
            mostrarAlerta('success', 'Inscrição realizada com sucesso! Faça login para continuar.');
            router.push(`/${evento.slug}/login`);
        } catch (error) {
            let msg = 'Erro ao realizar inscrição.';
            if (error?.response?.data?.message) {
                const bMsg = error.response.data.message;
                msg = typeof bMsg === 'string' ? bMsg : bMsg[0] || 'Erro';
            }
            mostrarAlerta('error', msg);
        } finally {
            setLoading(false);
        }
    };

    const updateField = (field, value) => setUserData({ ...userData, [field]: value });

    if (step === 'check_cpf') {
        return (
            <div className="max-w-md min-h-1/2 mx-auto py-8 px-4">
                <h1 className="text-3xl font-bold text-center mb-8 uppercase text-primary">Inscrição - {evento.nome}</h1>
                <div className="card bg-base-100 shadow-xl border border-base-200">
                    <div className="card-body">
                        <h2 className="card-title justify-center mb-6 text-xl font-bold uppercase text-primary">Verificação de Cadastro</h2>
                        <p className="text-center mb-4">Informe seu CPF para iniciar a inscrição.</p>
                        <Input
                            label="CPF"
                            value={cpfInput}
                            onChange={handleCpfChange}
                            type="text"
                            placeholder="000.000.000-00"
                        />
                        <div className="mt-6">
                            <Button
                                onClick={handleCheckCpf}
                                color="primary"
                                mode="primary"
                                className="btn-block btn-lg btn m-0"
                                disabled={loading}
                            >
                                {loading ? <LoadingSpinner /> : 'Verificar'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold text-center mb-8 uppercase text-primary">Inscrição - {evento.nome}</h1>
            <div className="card bg-base-100 shadow-xl border border-base-200">
                <div className="card-body">
                    <h2 className="card-title justify-center mb-4">
                        {isExistingUser ? 'Atualize seus dados' : 'Complete seu cadastro'}
                    </h2>

                    <Input label="CPF" value={userData.cpf} disabled={true} />
                    <Input label="Nome" value={userData.nome} onChange={(v) => updateField('nome', v)} />
                    <Input label="Email" type="email" value={userData.email} onChange={(v) => updateField('email', v)} />

                    <div className="form-control mb-4">
                        <label className="label"><span className="label-text font-semibold">Tipo de Vínculo</span></label>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <label className="label cursor-pointer gap-2">
                                <input type="radio" name="vinculo" className="radio radio-primary" checked={userData.vinculo == 1} onChange={() => updateField('vinculo', 1)} />
                                <span className="label-text">Aluno IFMS</span>
                            </label>
                            <label className="label cursor-pointer gap-2">
                                <input type="radio" name="vinculo" className="radio radio-primary" checked={userData.vinculo == 2} onChange={() => updateField('vinculo', 2)} />
                                <span className="label-text">Professor IFMS</span>
                            </label>
                            <label className="label cursor-pointer gap-2">
                                <input type="radio" name="vinculo" className="radio radio-primary" checked={userData.vinculo == 3} onChange={() => updateField('vinculo', 3)} />
                                <span className="label-text">Comunidade Externa</span>
                            </label>
                        </div>
                    </div>

                    {userData.vinculo == 1 && (
                        <Input label="RA (Registro Acadêmico)" value={userData.ra} onChange={(v) => updateField('ra', v)} />
                    )}
                    {userData.vinculo == 2 && (
                        <Input label="SIAPE" value={userData.siape} onChange={(v) => updateField('siape', v)} />
                    )}

                    <Input label="Instituição" value={userData.instituicao} onChange={(v) => updateField('instituicao', v)} />

                    {isExistingUser ? (
                        <>
                            <div className="divider">Confirmação de Identidade</div>
                            <Input label="Senha Atual" type="password" value={userData.senhaAtual} onChange={(v) => updateField('senhaAtual', v)} placeholder="Para atualizar seus dados, insira sua senha" />
                            <div className="text-right mt-1">
                                <a href={`/${evento.slug}/recoverpass`} className="link link-hover text-sm text-primary">Esqueci minha senha</a>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="divider">Senha de Acesso</div>
                            <Input label="Senha" type="password" value={userData.senha} onChange={(v) => updateField('senha', v)} placeholder="Crie uma senha de acesso" />
                            <Input label="Confirmar Senha" type="password" value={userData.confSenha} onChange={(v) => updateField('confSenha', v)} placeholder="Confirme sua senha" />
                        </>
                    )}

                    <div className="mt-6 flex flex-col gap-3">
                        <Button onClick={handleRegisterAndSubscribe} color="primary" mode="primary" className="btn-block m-0" disabled={loading}>
                            {loading ? <LoadingSpinner /> : 'Finalizar Inscrição'}
                        </Button>
                        <Button onClick={() => setStep('check_cpf')} color="error" mode="outline" className="btn-block m-0" disabled={loading}>
                            Voltar
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
