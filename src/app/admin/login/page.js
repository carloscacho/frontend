'use client'
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Login from '@/app/_components/screens/Login';
import Cadastro from '@/app/_components/screens/Cadastro';

export default function AdminLoginPage() {
    const { usuario, singupOpen } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (usuario) {
            // Check if user is admin
            if (usuario.tipo === 1) {
                router.push('/admin/home');
            } else {
                // Not an admin, redirect to root
                router.push('/');
            }
        }
    }, [usuario, router]);

    return (
        <div className="min-h-screen bg-base-200">
            {singupOpen ? <Cadastro /> : <Login redirectPath="/admin/home" />}
        </div>
    );
}
