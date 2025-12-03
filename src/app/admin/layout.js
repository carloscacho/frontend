'use client'
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Drawer from "@/app/_components/navigation/Drawer";
import Navbar from "@/app/_components/navigation/Navbar";
import Alert from "@/app/_components/feedback/Alert";

export default function AdminLayout({ children }) {
    const { usuario } = useAuth();
    const router = useRouter();

    useEffect(() => {
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
    }, [usuario, router]);

    // Don't render admin content if not authorized
    if (!usuario || usuario.tipo !== 1) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <Drawer>
                <Alert />
                {children}
            </Drawer>
        </>
    );
}
