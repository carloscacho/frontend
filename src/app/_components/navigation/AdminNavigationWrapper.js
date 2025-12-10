'use client';
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/app/_components/navigation/Navbar";
import Drawer from "@/app/_components/navigation/Drawer";
import Alert from "@/app/_components/feedback/Alert";

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
