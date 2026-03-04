'use client';
import { useAuth } from "@/shared/contexts/AuthContext";
import Navbar from "@/shared/components/navigation/Navbar";
import Drawer from "@/shared/components/navigation/Drawer";
import Alert from "@/shared/components/feedback/Alert";

export default function AdminNavigationWrapper({ children }) {
    const { usuario } = useAuth();
    const isAdmin = usuario?.tipo === 1;

    if (isAdmin) {
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
