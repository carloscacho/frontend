'use client'

import { useAuth } from '@/context/AuthContext'
import Card from "@/app/_components/displays/Card";
import Input from "@/app/_components/utils/Input";

export default function Login() {
  const { email, setEmail, senha, setSenha, login, setSingupOpen } = useAuth()
  return (
    <div className='flex justify-center center-content pt-20'>
      <Card>
        <span className="badge badge-lg badge-error">Somente Administradores</span>
        <div className="flex justify-between">
          <h2 className="text-4xl font-bold">Login</h2>
        </div>

        <div>
      
          <Input 
            label="Email"
            value={email}
            onChange={setEmail}
            type="email"
            placeholder="Digite seu email"
          />

          <Input
            label="Senha"
            value={senha}
            onChange={setSenha}
            type="password"
            placeholder="Digite sua senha"
          />
        </div>


        <div className="mt-6">
          <button onClick={() => login()} className="btn btn-primary btn-block">Entrar</button>
        </div>
        <div className="mt-3">
          <button onClick={() => setSingupOpen(true)} className="btn btn-secondary btn-block">Cadastrar</button>
        </div>
      </Card>
    </div>
  );
}
