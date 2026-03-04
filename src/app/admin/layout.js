'use client'
import { useEffect } from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLayout({ children }) {
    const { usuario } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const isLoginPage = pathname?.includes('/admin/login');

    useEffect(() => {
        // Skip check if on login page
        if (isLoginPage) return;

        // Check if user is logged in and is admin
        if (usuario) {
            if (usuario.tipo !== 1) {
                // Not an admin, redirect to root
                router.push('/');
            }
        } else {
            // Not logged in, redirect to admin login
            router.push('/admin/login');
        }
    }, [usuario, router, isLoginPage]);

    // Render login page immediately without sidebar/navbar if desired, 
    // or just render children. 
    // Usually login page has its own layout or doesn't need the admin drawer.
    if (isLoginPage) {
        return <>{children}</>;
    }

    // Don't render admin content if not authorized
    // Note: The visibility of Navbar/Drawer is now handled by AdminNavigationWrapper in root layout
    if (!usuario || usuario.tipo !== 1) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <>
            {children}
        </>
    );
}
