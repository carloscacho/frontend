import Drawer from "@/app/_components/navigation/Drawer";
import Navbar from "@/app/_components/navigation/Navbar";
import Alert from "@/app/_components/feedback/Alert";

export default function AdminLayout({ children }) {
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
