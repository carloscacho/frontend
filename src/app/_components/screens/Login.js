'use client'
import { useAuth } from '@/context/AuthContext'
import Card from '../displays/Card'

export default function Login({ redirectPath }) {
  const { email, setEmail, senha, setSenha, login, setSingupOpen } = useAuth()
  return (
    <div className='flex justify-center center-content pt-20'>
      <div className="lg:w-1/4 w-2/3">
        <Card>

          <div className="flex justify-between">
            <h2 className="text-4xl font-bold">Login</h2>
          </div>
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
            <button onClick={() => login(redirectPath)} className="btn btn-primary btn-block">Entrar</button>
          </div>
          <div className="mt-6">
            <button onClick={() => setSingupOpen(true)} className="btn btn-secondary btn-block">Cadastrar</button>
          </div>
        </Card>
      </div>
    </div>
  );
}
