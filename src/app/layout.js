
import "./globals.css";
import { AuthProvider } from '@/context/AuthContext';
import { AlertProvider } from "@/context/AlertContext";

import { DrawerProvider } from "@/context/DrawerContext";
import { EventFilterProvider } from "@/context/EventFilterContext";
import { ModalProvider } from "@/context/ModalContext";


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
                  {children}
                </AuthProvider>
              </AlertProvider>
            </ModalProvider>
          </EventFilterProvider>
        </DrawerProvider>

      </body>

    </html>
  );
}
