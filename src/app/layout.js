
import "./globals.css";
import { AuthProvider } from '@/context/AuthContext';
import { AlertProvider } from "@/context/AlertContext";
import Alert from "@/app/_components/feedback/Alert";
import Drawer from "@/app/_components/navigation/Drawer";

import { DrawerProvider } from "@/context/DrawerContext";
import { EventFilterProvider } from "@/context/EventFilterContext";
import Navbar from "@/app/_components/navigation/Navbar";
import { ModalProvider } from "@/context/ModalContext";


export const metadata = {
  title: "IFMS Eventos",
  description: "Sistema administrativo de eventos",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="lemonade">
      <head>
        <title>IFMS Eventos</title>
        <link rel="icon" href="./favicon.ico" />

      </head>
      <body className="bg-ifms">
        <DrawerProvider>
          <EventFilterProvider>
            <ModalProvider>
              <AlertProvider>
                <AuthProvider>
                  <Navbar />
                  <Drawer>
                    <Alert />
                    {children}
                  </Drawer>
                </AuthProvider>
              </AlertProvider>
            </ModalProvider>
          </EventFilterProvider>
        </DrawerProvider>

      </body>

    </html>
  );
}
