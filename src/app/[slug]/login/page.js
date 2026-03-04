'use client'
import { useAuth } from '@/shared/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEventLogin } from '@/modules/eventos/hooks/useEventLogin';
import EventHeader from './components/EventHeader';
import LoginForm from './components/LoginForm';
import RegistrationForm from './components/RegistrationForm';

export default function EventLoginPage() {
    const { singupOpen } = useAuth();
    const router = useRouter();
    const params = useParams();
    const slug = params.slug;

    const { evento, loading, subscribing } = useEventLogin(slug);

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
            <EventHeader evento={evento} />
            {singupOpen ? <RegistrationForm /> : <LoginForm redirectPath={`/${slug}/login`} />}
        </div>
    );
}
