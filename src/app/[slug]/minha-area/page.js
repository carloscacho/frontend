'use client'
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import QRCode from 'react-qr-code';
import { useAlerta } from '@/context/AlertContext';
import Cookies from 'js-cookie';
import Modal from '../../_components/displays/Modal';
import { useMinhaArea } from '@/hooks/useMinhaArea';

// Components
import UserProfile from './components/UserProfile';
import UserTimeline from './components/UserTimeline';
import UpdateInfoModal from './components/UpdateInfoModal';
import ChangePasswordModal from './components/ChangePasswordModal';

export default function MinhaAreaPage() {
    const { usuario, updateProfile, changePassword, logout } = useAuth();
    const { mostrarAlerta } = useAlerta();
    const router = useRouter();
    const params = useParams();
    const slug = params.slug;

    const { evento, loading, myActivities, loadingActivities } = useMinhaArea(slug);

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
                updateForm={updateForm}
                setUpdateForm={setUpdateForm}
                handleUpdateInfo={handleUpdateInfo}
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
