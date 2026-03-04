
import "./globals.css";
import { AuthProvider } from '@/shared/contexts/AuthContext';
import { AlertProvider } from "@/shared/contexts/AlertContext";

import { DrawerProvider } from "@/shared/contexts/DrawerContext";
import { EventFilterProvider } from "@/shared/contexts/EventFilterContext";
import { ModalProvider } from "@/shared/contexts/ModalContext";
import AdminNavigationWrapper from "@/shared/components/navigation/AdminNavigationWrapper";


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
