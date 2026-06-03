'use client'
import { useEffect } from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import LoadingSpinner from '@/shared/components/displays/LoadingSpinner';

export default function AdminLayout({ children }) {
    const { usuario } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const isLoginPage = pathname?.includes('/admin/login');

    useEffect(() => {
        // Skip check if on login page
        if (isLoginPage) return;

        // Check if user is logged in and authorized
        if (usuario) {
            const isAllowed = usuario.tipo === 1 || 
                (usuario.tipo === 4 && (
                    pathname === '/admin/home' || 
                    pathname.startsWith('/admin/relatorios') ||
                    pathname.startsWith('/admin/atividades') ||
                    pathname.startsWith('/admin/palestrantes')
                ));
            if (!isAllowed) {
                // Not authorized, redirect to root
                router.push('/');
            }
        } else {
            // Not logged in, redirect to admin login
            router.push('/admin/login');
        }
    }, [usuario, router, isLoginPage, pathname]);

    // Render login page immediately without sidebar/navbar if desired, 
    // or just render children. 
    // Usually login page has its own layout or doesn't need the admin drawer.
    if (isLoginPage) {
        return <>{children}</>;
    }

    // Don't render admin content if not authorized
    const isAllowed = usuario && (
        usuario.tipo === 1 ||
        (usuario.tipo === 4 && (
            pathname === '/admin/home' || 
            pathname.startsWith('/admin/relatorios') ||
            pathname.startsWith('/admin/atividades') ||
            pathname.startsWith('/admin/palestrantes')
        ))
    );

    if (!isAllowed) {
        return (
            <LoadingSpinner fullScreen={true} />
        );
    }

    return (
        <>
            {children}
        </>
    );
}
