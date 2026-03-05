'use client'
import { useState } from 'react';
import { useAuth } from '@/shared/contexts/AuthContext'
import Card from '../displays/Card'
import Button from '@/shared/components/utils/Button';

export default function Login({ redirectPath }) {
  const { login, setSingupOpen } = useAuth()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setError('');
    try {
      await login(email, senha, redirectPath);
    } catch (error) {
      setError(error.message || 'Erro ao fazer login');
    }
  }

  return (
    <div className='flex justify-center center-content pt-20'>
      <div className="lg:w-1/4 w-2/3">
        <Card>

          <div className="flex justify-between">
            <h2 className="text-4xl font-bold">Login</h2>
          </div>

          {error && (
            <div className="alert alert-error mt-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{error}</span>
            </div>
          )}

          <div className="mt-6">
            <div>
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input type="text" placeholder="email" className="input input-bordered w-full"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Senha</span>
              </label>
              <input type="password" placeholder="senha" className="input input-bordered w-full"
                value={senha} onChange={(e) => setSenha(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-6">
            <Button onClick={handleLogin} color="primary" mode="" className="btn-block m-0">Entrar</Button>
          </div>
          <div className="mt-6">
            <Button onClick={() => setSingupOpen(true)} color="secondary" mode="" className="btn-block m-0">Cadastrar</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

