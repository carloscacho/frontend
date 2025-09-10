'use client';
import { createContext, useContext, useState, useEffect, use } from 'react';
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
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('usuario');
    if (false) {
      console.log('usuario logado')
      setUsuario(JSON.parse(user));
    }
  }, []);

  useEffect(() => {
    if (usuario){
      router.push('/admin/salas')
      console.log("Entrei aqui")
    }
  }, [usuario])

  const login = async () => {
    console.log("fazendo login")
    const res = await fetch('http://localhost:4000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });

    const data = await res.json(); // Captura a mensagem do backend
    if(res.status === 200)
    console.log(data)
    if (!res.ok) {
      mostrarAlerta('error', data.error || 'Erro ao fazer login');
      throw new Error(data.error || 'Erro ao fazer login');
    }


    const { token, user } = data;
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(user));
    setUsuario(user);
  };

  const cadastrar = async () => {
    console.log("fazendo Cadastro")
    const res = await fetch('http://localhost:4000/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, cpf, email, senha }),
    });

    const data = await res.json(); // Captura a mensagem do backend

    if (!res.ok) {
      mostrarAlerta('error', data.error || 'Erro ao fazer cadastro');
      throw new Error(data.error || 'Erro ao fazer cadastro');
    
    }

    const { message, id } = data;
    setSingupOpen(false)
    mostrarAlerta('success', message)
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
