'use client';
import { createContext, useContext, useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAlerta } from './AlertContext';

import API from '@/utils/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')

  const [singupOpen, setSingupOpen] = useState(false)

  const router = useRouter();
  const { mostrarAlerta } = useAlerta()


  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('usuario');
    if (false) {
      console.log('usuario logado')
      setUsuario(JSON.parse(user));
    }
  }, []);

  useEffect(() => {
    if (usuario) {
      router.push('/admin/salas')
      console.log("Entrei aqui")
    }
  }, [usuario])

  const login = async () => {
    try {
      console.log("fazendo login")
      const res = await API.post("/auth/login", { email, senha });
 
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(user));
      setUsuario(user);

    } catch (error) {
      const { status, statusText } = error.response
      mostrarAlerta('error' + status, statusText || 'Erro ao fazer login');
      throw new Error(statusText || 'Erro ao fazer login');
    }



  };

  const cadastrar = async () => {
    try {
      console.log("fazendo Cadastro")
      const res = await API.get("/auth/signup", { nome, cpf, email, senha })


      const { message, id } = res.data;
      setSingupOpen(false)
      mostrarAlerta('success', message)
    } catch (error) {

      const { status, statusText } = error.response
      mostrarAlerta('error' + status, statusText || 'Erro ao fazer cadastro');
      throw new Error(statusText || 'Erro ao fazer cadastro');

    }

  };

  const logout = () => {
    localStorage.clear();
    setUsuario(null);
  };

  return (
    <AuthContext.Provider
      value={{
        email,
        senha,
        nome,
        setNome,
        cpf,
        setCpf,
        setEmail,
        setSenha,
        usuario,
        login,
        logout,
        singupOpen,
        setSingupOpen,
        cadastrar
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
