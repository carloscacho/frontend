'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useAlerta } from './AlertContext';

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
    const userCookie = Cookies.get('usuarioData');

    if (userCookie) {
      try {
        const parsedUser = JSON.parse(userCookie);
        if (parsedUser && parsedUser.token) {
          console.log('Usuário recuperado dos Cookies.');
          setUsuario(parsedUser);
        }
      } catch (e) {
        console.error("Erro ao ler cookie usuarioData", e);
      }
    }
  }, []);


  const login = async (redirectPath = null) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4455';
    console.log("Fazendo login...");
    const res = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });

    const data = await res.json();

    if (!res.ok) {
      const errorMessage = data.message || data.error || 'Erro ao fazer login';
      mostrarAlerta('error', errorMessage);
      throw new Error(errorMessage);
    }

    const { access_token, user } = data;

    // Merge token into user object for simple cookie management
    const userWithToken = { ...user, token: access_token };

    console.log('[AuthContext] Login successful.');
    Cookies.set('usuarioData', JSON.stringify(userWithToken), { expires: 7 });
    setUsuario(userWithToken);

    if (redirectPath) {
      router.push(redirectPath);
    }
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

    console.log('Usuário cadastrado:', data);
    setSingupOpen(false);
    mostrarAlerta('success', 'Cadastro realizado com sucesso!');
  };

  const logout = () => {
    Cookies.remove('usuarioData');
    setUsuario(null);
  };

  const updateProfile = async (data) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4455';
    const token = usuario?.token;

    const res = await fetch(`${apiUrl}/usuario/perfil`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const errorData = await res.json();
      const errorMessage = errorData.message || 'Erro ao atualizar informações';
      mostrarAlerta('error', errorMessage);
      throw new Error(errorMessage);
    }

    const updatedUser = await res.json();
    // Maintain the token when updating user info
    const newUserState = {
      ...usuario,
      ...updatedUser,
      token: token
    };

    Cookies.set('usuarioData', JSON.stringify(newUserState), { expires: 7 });
    setUsuario(newUserState);

    mostrarAlerta('success', 'Informações atualizadas com sucesso!');
    return updatedUser;
  };

  const changePassword = async (data) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4455';
    const token = usuario?.token;

    const res = await fetch(`${apiUrl}/usuario/alterar-senha`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const errorData = await res.json();
      const errorMessage = errorData.message || 'Erro ao alterar senha';
      mostrarAlerta('error', errorMessage);
      throw new Error(errorMessage);
    }

    mostrarAlerta('success', 'Senha alterada com sucesso!');
    return true;
  };

  const resetForm = () => {
    setNome('');
    setEmail('');
    setCpf('');
    setSenha('');
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
        cadastrar,
        resetForm,
        updateProfile,
        changePassword
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
