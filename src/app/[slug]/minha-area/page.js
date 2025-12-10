'use client'
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import QRCode from 'react-qr-code';
import { useAlerta } from '@/context/AlertContext';
import Cookies from 'js-cookie';
import Modal from '../../_components/displays/Modal';

export default function MinhaAreaPage() {
    const { usuario, updateProfile, changePassword, logout } = useAuth();
    const { mostrarAlerta } = useAlerta();
    const router = useRouter();
    const params = useParams();
    const slug = params.slug;

    const [evento, setEvento] = useState(null);
    const [loading, setLoading] = useState(true);

    // Modal refs
    const updateModalRef = useRef(null);
    const passwordModalRef = useRef(null);

    // Update info form state
    const [updateForm, setUpdateForm] = useState({
        nome: '',
        email: '',
        instituicao: '',
        comunidade: '',
        ra: ''
    });

    // Password form state
    const [passwordForm, setPasswordForm] = useState({
        senhaAtual: '',
        novaSenha: '',
        confirmarSenha: ''
    });

    const [myActivities, setMyActivities] = useState([]);
    const [loadingActivities, setLoadingActivities] = useState(true);

    useEffect(() => {
        if (!usuario) {
            router.push(`/${slug}/login`);
            return;
        }

        // Initialize update form with current user data
        setUpdateForm({
            nome: usuario.nome || '',
            email: usuario.email || '',
            instituicao: usuario.instituicao || '',
            comunidade: usuario.comunidade || '',
            ra: usuario.ra || ''
        });

        const fetchData = async () => {
            let currentEvento = null;

            // 1. Fetch Event
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4455';
                const res = await fetch(`${apiUrl}/evento/slug/${slug}`);
                if (res.ok) {
                    currentEvento = await res.json();
                    setEvento(currentEvento);
                }
            } catch (error) {
                console.error('Error fetching event:', error);
            } finally {
                setLoading(false);
            }

            // 2. Fetch and Filter Activities (only if event found and user has participant ID)
            if (currentEvento && usuario.participante?.[0]?.id_participante) {
                try {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4455';
                    // Fetch all activities for the participant
                    const res = await fetch(`${apiUrl}/data-atividade-participante/participante/${usuario.participante[0].id_participante}`);

                    if (res.ok) {
                        const data = await res.json();

                        // Filter activities by the current event ID
                        const filteredData = data.filter(item =>
                            item.data_atividade?.atividade?.fk_evento === currentEvento.id_evento
                        );

                        // Sort by date and time
                        const sorted = filteredData.sort((a, b) => {
                            const dateA = new Date(`${a.data_atividade.data.split('T')[0]}T${a.data_atividade.hora.split('T')[1]}`);
                            const dateB = new Date(`${b.data_atividade.data.split('T')[0]}T${b.data_atividade.hora.split('T')[1]}`);
                            return dateA - dateB;
                        });
                        setMyActivities(sorted);
                    }
                } catch (error) {
                    console.error('Error fetching activities:', error);
                } finally {
                    setLoadingActivities(false);
                }
            } else {
                setLoadingActivities(false);
            }
        };

        fetchData();
    }, [usuario, slug, router]);

    const handleUpdateInfo = async () => {
        try {
            // Prepare payload with correct types
            const payload = {
                ...updateForm,
                ra: updateForm.ra ? parseInt(updateForm.ra) : null,
                instituicao: updateForm.instituicao || null,
                comunidade: updateForm.comunidade || null
            };

            await updateProfile(payload);

            // Close modal
            if (updateModalRef.current) {
                updateModalRef.current.close();
            }

            // Reload page to reflect changes
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            console.error('Update error:', error);
            // Error is already handled in context
        }
    };

    const handleChangePassword = async () => {
        // Validation
        if (passwordForm.novaSenha !== passwordForm.confirmarSenha) {
            mostrarAlerta('error', 'As senhas não conferem');
            return;
        }

        if (passwordForm.novaSenha.length < 6) {
            mostrarAlerta('error', 'A nova senha deve ter no mínimo 6 caracteres');
            return;
        }

        try {
            await changePassword({
                senhaAtual: passwordForm.senhaAtual,
                novaSenha: passwordForm.novaSenha
            });

            // Close modal and reset form
            if (passwordModalRef.current) {
                passwordModalRef.current.close();
            }
            setPasswordForm({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
        } catch (error) {
            console.error('Password change error:', error);
            // Error is already handled in context
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (!usuario) {
        return null;
    }

    const participanteId = usuario.participante?.[0]?.id_participante;

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center mb-8 uppercase text-primary">
                Minha Área - {evento?.nome || 'Evento'}
            </h1>

            <div className="card bg-base-100 shadow-xl border border-base-200">
                <div className="card-body">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* QR Code Section */}
                        <div className="flex flex-col items-center justify-center">
                            <h2 className="text-2xl font-bold mb-4">Participante</h2>
                            {participanteId && (
                                <div className="bg-white p-6 rounded-lg">
                                    <QRCode title={participanteId.toString()} value={participanteId.toString()} size={200} />
                                </div>
                            )}
                            <button
                                onClick={handlePrint}
                                className="btn btn-info mt-4"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                Imprimir
                            </button>
                        </div>

                        {/* Information Section */}
                        <div className="space-y-4">
                            <div>
                                <label className="font-bold text-lg">Nome:</label>
                                <p className="text-xl">{usuario.nome}</p>
                            </div>

                            <div>
                                <label className="font-bold text-lg">E-mail:</label>
                                <p className="text-xl">{usuario.email}</p>
                            </div>

                            <div>
                                <label className="font-bold text-lg">CPF:</label>
                                <p className="text-xl">{usuario.cpf}</p>
                            </div>

                            {usuario.instituicao && (
                                <div>
                                    <label className="font-bold text-lg">Instituição:</label>
                                    <p className="text-xl">{usuario.instituicao}</p>
                                </div>
                            )}

                            {usuario.comunidade && (
                                <div>
                                    <label className="font-bold text-lg">Comunidade:</label>
                                    <p className="text-xl">{usuario.comunidade}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="divider"></div>
                    <div className="flex flex-wrap gap-4 justify-center mt-4 no-print">
                        <button
                            onClick={() => updateModalRef.current?.showModal()}
                            className="btn btn-warning"
                        >
                            Atualizar informações
                        </button>
                        <button
                            onClick={() => passwordModalRef.current?.showModal()}
                            className="btn btn-secondary"
                        >
                            Alterar Senha
                        </button>
                        <button
                            onClick={logout}
                            className="btn btn-error"
                        >
                            Sair
                        </button>
                    </div>

                    {/* Important Notice */}
                    <div className="alert alert-info mt-6 no-print">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span>
                            <strong>IMPORTANTE:</strong> o nome deve ser completo e sem abreviações, confira se as informações estão corretas até o fim do evento, pois serão usados para gerar os certificados e eles não serão refeitos.
                        </span>
                    </div>
                </div>
            </div>

            {/* Timeline Section */}
            <div className="mt-8">
                <h2 className="text-2xl font-bold text-center mb-6 uppercase text-primary">Minha Timeline</h2>

                {loadingActivities ? (
                    <div className="flex justify-center">
                        <span className="loading loading-spinner loading-md"></span>
                    </div>
                ) : myActivities.length === 0 ? (
                    <div className="text-center text-gray-500">
                        Você ainda não se inscreveu em nenhuma atividade.
                    </div>
                ) : (
                    <ul className="timeline timeline-snap-icon max-md:timeline-compact timeline-vertical">
                        {myActivities.map((activity, index) => {
                            const date = new Date(activity.data_atividade.data);
                            const formattedDate = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });
                            const startTime = new Date(activity.data_atividade.hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
                            const endTimeString = calculateEndTime(activity.data_atividade.data, activity.data_atividade.hora, activity.data_atividade.duracao);

                            // Calculate status
                            const now = new Date();
                            // Construct full start and end dates for comparison
                            const startDateTime = new Date(`${activity.data_atividade.data.split('T')[0]}T${activity.data_atividade.hora.split('T')[1]}`);
                            let endDateTime = null;
                            if (activity.data_atividade.duracao) {
                                endDateTime = new Date(`${activity.data_atividade.data.split('T')[0]}T${activity.data_atividade.duracao.split('T')[1]}`);
                            }

                            const isPresent = activity.presenca === 1; // Assuming 1 is present
                            const isHappeningNow = endDateTime && now >= startDateTime && now <= endDateTime;
                            const isPast = endDateTime && now > endDateTime;
                            const isAbsent = isPast && !isPresent;

                            let statusColor = 'text-primary';
                            let statusIconColor = 'text-primary';
                            let statusMessage = null;

                            if (isPresent) {
                                statusColor = 'text-success';
                                statusIconColor = 'text-success';
                                statusMessage = <span className="badge badge-success gap-2">Presença Confirmada</span>;
                            } else if (isHappeningNow) {
                                statusColor = 'text-warning';
                                statusIconColor = 'text-warning';
                                statusMessage = <span className="badge badge-warning gap-2 animate-pulse">Acontecendo Agora!</span>;
                            } else if (isAbsent) {
                                statusColor = 'text-error';
                                statusIconColor = 'text-error';
                                statusMessage = <span className="badge badge-error gap-2">Ausente</span>;
                            }

                            return (
                                <li key={index}>
                                    <div className="timeline-middle">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`h-5 w-5 ${statusIconColor}`}>
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className={`timeline-start md:text-end mb-10 ${index % 2 === 0 ? 'md:mr-4' : 'md:ml-4'}`}>
                                        <time className="font-mono italic">{formattedDate} - {startTime}</time>
                                        <div className={`text-lg font-black ${statusColor}`}>{activity.data_atividade.atividade.nome}</div>
                                        <p className="text-sm text-gray-600">
                                            Local: {activity.data_atividade.atividade.sala?.nome || 'A definir'}
                                        </p>
                                        {endTimeString && <p className="text-xs">Até: {endTimeString}</p>}
                                        {statusMessage && <div className="mt-2">{statusMessage}</div>}
                                    </div>
                                    <hr className={`bg-primary`} />
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {/* Update Info Modal */}
            <Modal refModal={updateModalRef}>
                <h3 className="font-bold text-lg mb-4">Atualizar Informações</h3>
                <div className="space-y-4">
                    <div>
                        <label className="label">
                            <span className="label-text">Nome Completo *</span>
                        </label>
                        <input
                            type="text"
                            className="input input-bordered w-full"
                            value={updateForm.nome}
                            onChange={(e) => setUpdateForm({ ...updateForm, nome: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="label">
                            <span className="label-text">E-mail *</span>
                        </label>
                        <input
                            type="email"
                            className="input input-bordered w-full"
                            value={updateForm.email}
                            onChange={(e) => setUpdateForm({ ...updateForm, email: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="label">
                            <span className="label-text">Instituição</span>
                        </label>
                        <input
                            type="text"
                            className="input input-bordered w-full"
                            value={updateForm.instituicao}
                            onChange={(e) => setUpdateForm({ ...updateForm, instituicao: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="label">
                            <span className="label-text">Comunidade</span>
                        </label>
                        <input
                            type="text"
                            className="input input-bordered w-full"
                            value={updateForm.comunidade}
                            onChange={(e) => setUpdateForm({ ...updateForm, comunidade: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="label">
                            <span className="label-text">RA</span>
                        </label>
                        <input
                            type="text"
                            className="input input-bordered w-full"
                            value={updateForm.ra}
                            onChange={(e) => setUpdateForm({ ...updateForm, ra: e.target.value })}
                        />
                    </div>
                </div>

                <div className="modal-action">
                    <button type="button" className="btn" onClick={() => updateModalRef.current?.close()}>Cancelar</button>
                    <button type="button" className="btn btn-primary" onClick={handleUpdateInfo}>Salvar</button>
                </div>
            </Modal>

            {/* Change Password Modal */}
            <Modal refModal={passwordModalRef}>
                <h3 className="font-bold text-lg mb-4">Alterar Senha</h3>
                <div className="space-y-4">
                    <div>
                        <label className="label">
                            <span className="label-text">Senha Atual *</span>
                        </label>
                        <input
                            type="password"
                            className="input input-bordered w-full"
                            value={passwordForm.senhaAtual}
                            onChange={(e) => setPasswordForm({ ...passwordForm, senhaAtual: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="label">
                            <span className="label-text">Nova Senha *</span>
                        </label>
                        <input
                            type="password"
                            className="input input-bordered w-full"
                            value={passwordForm.novaSenha}
                            onChange={(e) => setPasswordForm({ ...passwordForm, novaSenha: e.target.value })}
                            required
                            minLength={6}
                        />
                    </div>

                    <div>
                        <label className="label">
                            <span className="label-text">Confirmar Nova Senha *</span>
                        </label>
                        <input
                            type="password"
                            className="input input-bordered w-full"
                            value={passwordForm.confirmarSenha}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmarSenha: e.target.value })}
                            required
                            minLength={6}
                        />
                    </div>
                </div>

                <div className="modal-action">
                    <button
                        type="button"
                        className="btn"
                        onClick={() => {
                            passwordModalRef.current?.close();
                            setPasswordForm({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
                        }}
                    >
                        Cancelar
                    </button>
                    <button type="button" className="btn btn-primary" onClick={handleChangePassword}>Alterar Senha</button>
                </div>
            </Modal>

            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .card, .card * {
                        visibility: visible;
                    }
                    .card {
                        position: absolute;
                        left: 0;
                        top: 0;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
}
