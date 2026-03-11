import { useState } from 'react';
import { useAlerta } from '@/shared/contexts/AlertContext';
import { usuarioService } from '@/modules/usuarios/services/usuario.service';
import { useRouter } from 'next/navigation';

export function usePasswordRecovery(slug) {
    const { mostrarAlerta } = useAlerta();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const requestPasswordReset = async (cpfOrEmail) => {
        if (!cpfOrEmail) {
            mostrarAlerta('error', 'Por favor, informe seu CPF ou Email.');
            return false;
        }

        setLoading(true);
        try {
            const resetUrlPrefix = `${window.location.origin}${window.location.pathname}/reset`;

            const data = await usuarioService.requestPasswordReset({
                cpfOrEmail,
                resetUrlPrefix
            });

            mostrarAlerta('success', data.message || 'E-mail de recuperação enviado com sucesso!');
            return true;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Erro ao solicitar recuperação de senha.';
            mostrarAlerta('error', errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async (token, newPassword, confirmPassword) => {
        if (!token) {
            mostrarAlerta('error', 'Token de recuperação inválido ou ausente.');
            return false;
        }

        if (newPassword !== confirmPassword) {
            mostrarAlerta('error', 'As senhas não coincidem.');
            return false;
        }

        if (newPassword.length < 6) {
            mostrarAlerta('error', 'A nova senha deve ter no mínimo 6 caracteres.');
            return false;
        }

        setLoading(true);
        try {
            const data = await usuarioService.resetPassword({
                token,
                newPassword
            });

            mostrarAlerta('success', data.message || 'Senha redefinida com sucesso! Redirecionando para o login...');

            setTimeout(() => {
                router.push(`/${slug}/login`);
            }, 3000);

            return true;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Erro ao redefinir a senha.';
            mostrarAlerta('error', errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { requestPasswordReset, resetPassword, loading };
}
