
import "./globals.css";
import { AuthProvider } from '@/context/AuthContext';
import { AlertProvider } from "@/context/AlertContext";

import { DrawerProvider } from "@/context/DrawerContext";
import { EventFilterProvider } from "@/context/EventFilterContext";
import { ModalProvider } from "@/context/ModalContext";
import AdminNavigationWrapper from "./_components/navigation/AdminNavigationWrapper";


export const metadata = {
  title: "IFMS Eventos",
  description: "Sistema administrativo de eventos",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="lemonade">
      <body className="bg-ifms">
        <DrawerProvider>
          <EventFilterProvider>
            <ModalProvider>
              <AlertProvider>
                <AuthProvider>
                  <AdminNavigationWrapper>
                    {children}
                  </AdminNavigationWrapper>
                </AuthProvider>
              </AlertProvider>
            </ModalProvider>
          </EventFilterProvider>
        </DrawerProvider>

      </body>

    </html>
  );
}
