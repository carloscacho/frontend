'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useAlerta } from './AlertContext';

const AuthContext = createContext();

// Cookie expiration: 5 days (same as refresh token)
const COOKIE_EXPIRATION_DAYS = 5;

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [singupOpen, setSingupOpen] = useState(false);

  const router = useRouter();
  const { mostrarAlerta } = useAlerta();

  // Load user from cookie on mount
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

  /**
   * Login with email or cpf and password
   * @param {string} loginParam 
   * @param {string} senha 
   * @param {string|null} redirectPath 
   */
  const login = async (loginParam, senha, redirectPath = null) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4455';
    console.log("Fazendo login...");
    const res = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: loginParam, senha }),
    });

    const data = await res.json();

    if (!res.ok) {
      const errorMessage = data.message || data.error || 'Erro ao fazer login';
      mostrarAlerta('error', errorMessage);
      throw new Error(errorMessage);
    }

    const { access_token, refresh_token, user } = data;

    // Store tokens and user data
    const userWithTokens = {
      ...user,
      token: access_token,
      refreshToken: refresh_token
    };

    console.log('[AuthContext] Login successful.');
    Cookies.set('usuarioData', JSON.stringify(userWithTokens), { expires: COOKIE_EXPIRATION_DAYS });
    setUsuario(userWithTokens);

    if (redirectPath) {
      router.push(redirectPath);
    }
  };

  /**
   * Refresh access token using refresh token
   * @returns {Promise<string>} New access token
   */
  const refreshAccessToken = useCallback(async () => {
    const userCookie = Cookies.get('usuarioData');
    if (!userCookie) {
      throw new Error('No user data found');
    }

    const userData = JSON.parse(userCookie);
    const refreshToken = userData.refreshToken;

    if (!refreshToken) {
      throw new Error('No refresh token found');
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4455';
    const res = await fetch(`${apiUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await res.json();
    const newAccessToken = data.access_token;

    // Update stored token
    const updatedUser = { ...userData, token: newAccessToken };
    Cookies.set('usuarioData', JSON.stringify(updatedUser), { expires: COOKIE_EXPIRATION_DAYS });
    setUsuario(updatedUser);

    console.log('[AuthContext] Token refreshed successfully.');
    return newAccessToken;
  }, []);

  /**
   * Register a new user
   * @param {Object} userData - { nome, cpf, email, senha }
   */
  const cadastrar = async (userData) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4455';
    console.log("Fazendo cadastro...");
    const res = await fetch(`${apiUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
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

  const logout = useCallback(() => {
    Cookies.remove('usuarioData');
    setUsuario(null);
  }, []);

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
    // Maintain tokens when updating user info
    const newUserState = {
      ...usuario,
      ...updatedUser,
      token: usuario?.token,
      refreshToken: usuario?.refreshToken
    };

    Cookies.set('usuarioData', JSON.stringify(newUserState), { expires: COOKIE_EXPIRATION_DAYS });
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

  return (
    <AuthContext.Provider
      value={{
        usuario,
        setUsuario,
        login,
        logout,
        singupOpen,
        setSingupOpen,
        cadastrar,
        updateProfile,
        changePassword,
        refreshAccessToken
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};

// Export for use in api.js interceptor
export const getRefreshFunction = () => {
  const userCookie = Cookies.get('usuarioData');
  if (!userCookie) return null;

  const userData = JSON.parse(userCookie);
  return userData.refreshToken ? true : false;
};
