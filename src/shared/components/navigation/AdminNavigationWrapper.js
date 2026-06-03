'use client';
import { useAuth } from "@/shared/contexts/AuthContext";
import { usePathname } from "next/navigation";
import Navbar from "@/shared/components/navigation/Navbar";
import Drawer from "@/shared/components/navigation/Drawer";
import Alert from "@/shared/components/feedback/Alert";

export default function AdminNavigationWrapper({ children }) {
    const { usuario } = useAuth();
    const pathname = usePathname();
    const isAdmin = usuario?.tipo === 1;
    const isAllowedResponsavel = usuario?.tipo === 4 && 
        (pathname === '/admin/home' || 
         pathname?.startsWith('/admin/relatorios') ||
         pathname?.startsWith('/admin/atividades') ||
         pathname?.startsWith('/admin/palestrantes'));

    if (isAdmin || isAllowedResponsavel) {
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

    return (
        <>
            <Alert />
            {children}
        </>
    );
}
