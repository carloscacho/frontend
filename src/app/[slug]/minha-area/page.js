'use client'
import { useAuth } from '@/shared/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useAlerta } from '@/shared/contexts/AlertContext';
import { useMinhaArea } from '@/modules/usuarios/hooks/useMinhaArea';

// Components
import UserProfile from '@/modules/usuarios/components/UserProfile';
import UserTimeline from '@/modules/usuarios/components/UserTimeline';
import UpdateInfoModal from '@/modules/usuarios/components/UpdateInfoModal';
import ChangePasswordModal from '@/modules/usuarios/components/ChangePasswordModal';
import LoadingSpinner from '@/shared/components/displays/LoadingSpinner';

export default function MinhaAreaPage() {
    const { usuario, changePassword, logout } = useAuth();
    const { mostrarAlerta } = useAlerta();
    const router = useRouter();
    const params = useParams();
    const slug = params.slug;

    const { evento, loading, myActivities, loadingActivities } = useMinhaArea(slug);

    // Modal refs
    const updateModalRef = useRef(null);
    const passwordModalRef = useRef(null);

    // Password form state
    const [passwordForm, setPasswordForm] = useState({
        senhaAtual: '',
        novaSenha: '',
        confirmarSenha: ''
    });

    useEffect(() => {
        if (!loading && !usuario) {
            router.push(`/${slug}/login`);
        }
    }, [loading, usuario, router, slug]);

    if (loading) {
        return <LoadingSpinner fullScreen={true} />;
    }

    if (!usuario) {
        return null;
    }

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

    const participanteId = usuario.participante?.[0]?.id_participante;

    const onClosePasswordModal = () => {
        passwordModalRef.current?.close();
        setPasswordForm({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center mb-8 uppercase text-primary">
                Minha Área - {evento?.nome || 'Evento'}
            </h1>

            <UserProfile
                usuario={usuario}
                participanteId={participanteId}
                onUpdateClick={() => updateModalRef.current?.showModal()}
                onPasswordClick={() => passwordModalRef.current?.showModal()}
                onLogout={logout}
            />

            <UserTimeline
                loadingActivities={loadingActivities}
                myActivities={myActivities}
            />

            <UpdateInfoModal
                refModal={updateModalRef}
                evento={evento}
            />

            <ChangePasswordModal
                refModal={passwordModalRef}
                passwordForm={passwordForm}
                setPasswordForm={setPasswordForm}
                handleChangePassword={handleChangePassword}
                onClose={onClosePasswordModal}
            />
        </div>
    );
}
