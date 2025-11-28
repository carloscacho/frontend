'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
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
    const token = Cookies.get('token');
    const user = Cookies.get('usuario');
    // 1. CORREÇÃO: Verifica se o token e o usuário existem para manter o login
    if (token && user) {
      console.log('Usuário recuperado dos cookies.');
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
    // 2. MELHORIA: Usar variável de ambiente para a URL da API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4455';
    console.log("Fazendo login...");
    const res = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });

    const data = await res.json();

    if (!res.ok) {
      // 3. MELHORIA: Tratamento de erro mais robusto
      const errorMessage = data.message || data.error || 'Erro ao fazer login';
      mostrarAlerta('error', errorMessage);
      throw new Error(errorMessage);
    }

    const { access_token, user } = data;
    const token = access_token;
    console.log('[AuthContext] Login successful, token received:', token ? token.substring(0, 20) + '...' : 'MISSING');
    Cookies.set('token', token, { expires: 7 }); // Expira em 7 dias
    Cookies.set('usuario', JSON.stringify(user), { expires: 7 });
    console.log('[AuthContext] Token saved to cookie');
    console.log('[AuthContext] Verifying token in cookie:', Cookies.get('token') ? 'Found' : 'NOT FOUND');
    setUsuario(user);
  };

  const cadastrar = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4455';
    console.log("Fazendo cadastro...");
    const res = await fetch(`${apiUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, cpf, email, senha }),
    });

    const data = await res.json();

    if (!res.ok) {
      const errorMessage = data.message || data.error || 'Erro ao fazer cadastro';
      mostrarAlerta('error', errorMessage);
      throw new Error(errorMessage);
    }

    // 4. CORREÇÃO: A API retorna o objeto 'user', não 'message' e 'id'
    console.log('Usuário cadastrado:', data);
    setSingupOpen(false);
    mostrarAlerta('success', 'Cadastro realizado com sucesso!');
  };

  const logout = () => {
    Cookies.remove('token');
    Cookies.remove('usuario');
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
