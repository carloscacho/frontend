'use client';
import { createContext, useContext, useState } from 'react';

const DrawerContext = createContext();

export function DrawerProvider({ children }) {
  const [drawer, setDrawer] = useState(true);

  // Handle responsive behavior
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', () => {
      if (window.innerWidth < 1024) {
        setDrawer(false);
      } else {
        setDrawer(true);
      }
    });
  }

  const trocarDrawer = () => {
    setDrawer(!drawer)
  };

  return (
    <DrawerContext.Provider value={{ drawer, trocarDrawer, setDrawer }}>
      {children}
    </DrawerContext.Provider>
  );
}

export const useDrawer = () => useContext(DrawerContext);
