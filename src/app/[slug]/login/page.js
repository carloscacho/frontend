'use client'
import { useAuth } from '@/shared/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEventLogin } from '@/modules/eventos/hooks/useEventLogin';
import EventHeader from '@/modules/eventos/components/EventHeader';
import LoginForm from '@/modules/eventos/components/LoginForm';
import RegistrationForm from '@/modules/eventos/components/RegistrationForm';
import LoadingSpinner from '@/shared/components/displays/LoadingSpinner';
import Button from '@/shared/components/utils/Button';

export default function EventLoginPage() {
    const { singupOpen } = useAuth();
    const router = useRouter();
    const params = useParams();
    const slug = params.slug;

    const { evento, loading, subscribing } = useEventLogin(slug);

    if (loading) {
        return <LoadingSpinner fullScreen={true} />;
    }

    if (!evento) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-200">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Evento não encontrado</h1>
                    <Button onClick={() => router.push('/')} mode="" color="primary" className="m-0">
                        Voltar para Home
                    </Button>
                </div>
            </div>
        );
    }

    if (subscribing) {
        return <LoadingSpinner fullScreen={true} message="Processando sua inscrição..." />;
    }

    return (
        <div className="min-h-screen bg-base-200">
            <EventHeader evento={evento} />
            {singupOpen ? <RegistrationForm /> : <LoginForm redirectPath={`/${slug}/login`} />}
        </div>
    );
}
