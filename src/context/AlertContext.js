'use client';
import { createContext, useContext, useState } from 'react';

const AlertContext = createContext();

export function AlertProvider({ children }) {
  const [alerta, setAlerta] = useState(null);

  const mostrarAlerta = (tipo, msg) => {
    setAlerta({ tipo, msg });
    setTimeout(() => setAlerta(null), 3000); // limpa em 3s
  };

  return (
    <AlertContext.Provider value={{ alerta, mostrarAlerta }}>
      {children}
    </AlertContext.Provider>
  );
}

export const useAlerta = () => useContext(AlertContext);
