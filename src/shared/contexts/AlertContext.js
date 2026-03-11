'use client';
import { createContext, useContext, useState } from 'react';

const AlertContext = createContext();

export function AlertProvider({ children }) {
  const [alertas, setAlertas] = useState([]);

  const removerAlerta = (id) => {
    setAlertas((prev) => prev.filter((alerta) => alerta.id !== id));
  };

  const mostrarAlerta = (tipo, msg) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setAlertas((prev) => [...prev, { id, tipo, msg }]);
    setTimeout(() => removerAlerta(id), 3000); // limpa em 3s
  };

  return (
    <AlertContext.Provider value={{ alertas, mostrarAlerta }}>
      {children}
    </AlertContext.Provider>
  );
}

export const useAlerta = () => useContext(AlertContext);
