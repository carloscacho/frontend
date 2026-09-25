'use client'
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useAlerta } from "@/shared/contexts/AlertContext";
import Input from "@/shared/components/utils/Input";
import Button from "@/shared/components/utils/Button";
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/shared/components/displays/LoadingSpinner';
import { usuarioService } from '@/modules/usuarios/services/usuario.service';
import { turmaService } from '@/modules/turmas/services/turma.service';
import { turnoService } from '@/modules/turnos/services/turno.service';
import MultiSelect from '@/shared/components/utils/MultiSelect';
import { getSemestersOptions } from '@/shared/utils/dateUtils';

export default function RegistrationView({ evento }) {
    const { usuario, setSingupOpen } = useAuth();
    const { mostrarAlerta } = useAlerta();
    const router = useRouter();

    const [step, setStep] = useState('check_cpf'); // check_cpf, registration_form
    const [cpfInput, setCpfInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [turmas, setTurmas] = useState([]);
    const [turnos, setTurnos] = useState([]);

    // Form fields
    const [userData, setUserData] = useState({
        nome: '', email: '', cpf: '',
        senha: '', confSenha: '', senhaAtual: '',
        vinculo: 1, ra: '', siape: '', instituicao: '',
        fk_turma: '', fk_turno: '', semestre: '',
        fk_turmas: [],
        primeiro_acesso: undefined
    });
    const [isExistingUser, setIsExistingUser] = useState(false);

    useEffect(() => {
        const fetchTurmasAndTurnos = async () => {
            try {
                const turmasData = await turmaService.getAll();
                const turnosData = await turnoService.getAll();
                setTurmas(turmasData || []);
                setTurnos(turnosData || []);
            } catch (err) {
                console.error("Erro ao carregar turmas e turnos:", err);
            }
        };
        fetchTurmasAndTurnos();
    }, []);

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
                    fk_turma: data.user.participante?.[0]?.fk_turma || '',
                    fk_turno: data.user.participante?.[0]?.fk_turno || '',
                    semestre: data.user.participante?.[0]?.semestre || '',
                    fk_turmas: data.user.participante?.[0]?.participante_turma?.map(pt => pt.fk_turma) || [],
                    primeiro_acesso: data.user.primeiro_acesso,
                });
                setStep('registration_form');
            } else {
                mostrarAlerta('info', 'CPF não cadastrado. Preencha o formulário para se cadastrar e inscrever.');
                setIsExistingUser(false);
                setUserData({
                    nome: '', email: '',
                    senha: '', confSenha: '', senhaAtual: '',
                    vinculo: 1, ra: '', siape: '', instituicao: '',
                    fk_turma: '', fk_turno: '', semestre: '',
                    fk_turmas: [],
                    cpf: cpfInput,
                    primeiro_acesso: undefined
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
        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            mostrarAlerta('error', 'Email inválido. Verifique se o email está no formato correto (ex: nome@email.com).');
            return;
        }
        if (userData.vinculo == 1) {
            if (!userData.ra) {
                mostrarAlerta('error', 'RA (Registro Acadêmico) é obrigatório.');
                return;
            }
            if (!userData.fk_turma) {
                mostrarAlerta('error', 'Curso é obrigatório.');
                return;
            }
            if (!userData.fk_turno) {
                mostrarAlerta('error', 'Turno é obrigatório.');
                return;
            }
            if (!userData.semestre) {
                mostrarAlerta('error', 'Semestre é obrigatório.');
                return;
            }
        }
        if (userData.vinculo == 2) {
            if (!userData.siape) {
                mostrarAlerta('error', 'SIAPE é obrigatório.');
                return;
            }
            if (!userData.fk_turmas || userData.fk_turmas.length === 0) {
                mostrarAlerta('error', 'Selecione pelo menos um curso.');
                return;
            }
        }
        if (isExistingUser && !userData.primeiro_acesso && !userData.senhaAtual) {
            mostrarAlerta('error', 'Insira sua senha atual para confirmar a atualização de dados.');
            return;
        }
        if (!isExistingUser || (isExistingUser && userData.primeiro_acesso)) {
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
                instituicao: userData.vinculo == 3 && userData.instituicao ? userData.instituicao : undefined,
                fk_turma: userData.vinculo == 1 && userData.fk_turma ? Number(userData.fk_turma) : undefined,
                fk_turno: userData.vinculo == 1 && userData.fk_turno ? Number(userData.fk_turno) : undefined,
                semestre: userData.vinculo == 1 && userData.semestre ? Number(userData.semestre) : undefined,
                fk_turmas: userData.vinculo == 2 && userData.fk_turmas ? userData.fk_turmas.map(Number) : undefined,
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Nome - full width */}
                        <div className="sm:col-span-2">
                            <Input label="Nome" value={userData.nome} onChange={(v) => updateField('nome', v)} />
                        </div>

                        {/* CPF and Email - two columns */}
                        <Input label="CPF" value={userData.cpf} disabled={true} />
                        <Input label="Email" type="email" value={userData.email} onChange={(v) => updateField('email', v)} />

                        {/* Tipo de Vínculo - full width */}
                        <div className="form-control sm:col-span-2 mb-2">
                            <label className="label"><span className="label-text font-semibold">Tipo de Vínculo</span></label>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <label className="label cursor-pointer gap-2">
                                    <input type="radio" name="vinculo" className="radio radio-primary" checked={userData.vinculo == 1} onChange={() => updateField('vinculo', 1)} />
                                    <span className="label-text">Aluno IFMS</span>
                                </label>
                                <label className="label cursor-pointer gap-2">
                                    <input type="radio" name="vinculo" className="radio radio-primary" checked={userData.vinculo == 2} onChange={() => {
                                        updateField('vinculo', 2);
                                    }} />
                                    <span className="label-text">Professor IFMS</span>
                                </label>
                                <label className="label cursor-pointer gap-2">
                                    <input type="radio" name="vinculo" className="radio radio-primary" checked={userData.vinculo == 3} onChange={() => {
                                        updateField('vinculo', 3);
                                    }} />
                                    <span className="label-text">Comunidade Externa</span>
                                </label>
                            </div>
                        </div>

                        {/* Conditional fields based on Vínculo */}
                        {userData.vinculo == 1 && (
                            <>
                                {/* Curso and RA in two columns */}
                                <div className="form-control">
                                    <label className="label"><span className="label-text font-semibold">Curso</span></label>
                                    <select
                                        className="select select-bordered w-full"
                                        value={userData.fk_turma}
                                        onChange={(e) => updateField('fk_turma', e.target.value ? Number(e.target.value) : '')}
                                        data-testid="select-Curso"
                                    >
                                        <option value="">Selecione o Curso</option>
                                        {turmas.map((t) => (
                                            <option key={t.id_turma} value={t.id_turma}>{t.nome}</option>
                                        ))}
                                    </select>
                                </div>
                                <Input label="RA (Registro Acadêmico)" value={userData.ra} onChange={(v) => updateField('ra', v)} />

                                {/* Turno and Semestre in two columns */}
                                <div className="form-control">
                                    <label className="label"><span className="label-text font-semibold">Turno</span></label>
                                    <select
                                        className="select select-bordered w-full"
                                        value={userData.fk_turno}
                                        onChange={(e) => updateField('fk_turno', e.target.value ? Number(e.target.value) : '')}
                                        data-testid="select-Turno"
                                    >
                                        <option value="">Selecione o Turno</option>
                                        {turnos.map((t) => (
                                            <option key={t.id_turno} value={t.id_turno}>{t.nome}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-control">
                                    <label className="label"><span className="label-text font-semibold">Ano de Entrada (semestre atual)</span></label>
                                    <select
                                        className="select select-bordered w-full"
                                        value={userData.semestre}
                                        onChange={(e) => updateField('semestre', e.target.value ? Number(e.target.value) : '')}
                                        data-testid="select-Semestre"
                                    >
                                        <option value="">Selecione o Semestre</option>
                                        {getSemestersOptions().map((opt) => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}

                        {userData.vinculo == 2 && (
                            <>
                                {/* Cursos (MultiSelect) and SIAPE in two columns */}
                                <div className="form-control">
                                    <MultiSelect
                                        label="Curso(s)"
                                        options={turmas}
                                        selectedValues={userData.fk_turmas || []}
                                        onChange={(selected) => updateField('fk_turmas', selected)}
                                        valueKey="id_turma"
                                        labelKey="nome"
                                    />
                                </div>
                                <Input label="SIAPE" value={userData.siape} onChange={(v) => updateField('siape', v)} />
                            </>
                        )}

                        {userData.vinculo == 3 && (
                            <div className="sm:col-span-2">
                                <Input label="Instituição" value={userData.instituicao} onChange={(v) => updateField('instituicao', v)} />
                            </div>
                        )}
                    </div>

                    {isExistingUser && !userData.primeiro_acesso ? (
                        <>
                            <div className="divider">Confirmação de Identidade</div>
                            <Input label="Senha Atual" type="password" value={userData.senhaAtual} onChange={(v) => updateField('senhaAtual', v)} placeholder="Para atualizar seus dados, insira sua senha" />
                            <div className="text-right mt-1">
                                <a href={`/${evento.slug}/recoverpass`} className="link link-hover text-sm text-primary">Esqueci minha senha</a>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="divider">{isExistingUser && userData.primeiro_acesso ? 'Crie sua Senha de Acesso' : 'Senha de Acesso'}</div>
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
