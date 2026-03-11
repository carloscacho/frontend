import ResetPasswordForm from '@/modules/eventos/components/ResetPasswordForm';
import { Suspense } from 'react';

export default function ResetPasswordPage() {
    return (
        <div className="min-h-[50vh] flex items-center justify-center">
            <Suspense fallback={<div className="loading loading-spinner text-primary"></div>}>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
}
