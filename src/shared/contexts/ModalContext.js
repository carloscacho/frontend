'use client';
import { createContext, useContext, useRef, useState } from 'react';

const ModalContext = createContext();

export function ModalProvider({ children }) {
  const [mdVisible, setModalVisible] = useState(false);
  const [refMd, setRefMd] = useState(null)

  const trocarModal = () => {
    setModalVisible(!mdVisible)
  };



  return (
    <ModalContext.Provider value={{ mdVisible, trocarModal, refMd, setRefMd }}>
      {children}
    </ModalContext.Provider>
  );
}

export const useModal = () => useContext(ModalContext);
