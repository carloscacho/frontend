'use client'
import { useState } from 'react';

import { useAuth } from '@/context/AuthContext'
import Card from "@/app/_components/displays/Card";
import Input from "@/app/_components/utils/Input";
import { useAlerta } from "@/context/AlertContext"

export default function Cadastro() {
  const { email, setEmail, senha, setSenha, login,
    nome, setNome, cpf, setCpf, singupOpen, setSingupOpen, cadastrar, } = useAuth()
  const [confSenha, setConfSenha] = useState('')

  const { mostrarAlerta } = useAlerta()

  const preCadastro = () => {
    if (senha.length < 6) {
      mostrarAlerta('error', 'Senha deve ter no minimo seis caracteres')
    }
    else if (senha !== confSenha) {
      mostrarAlerta('error', 'Senha e Confirmação de senha são diferentes')
    }
    else if (cpf.length < 11) {
      mostrarAlerta('error', 'cpf deve ter no minimo onze caracteres')
    }
    else {
      cadastrar()
    }
  }

  return (
    <div className='flex justify-center center-content pt-20'>
      <div className="lg:w-1/4 w-2/3">
        <Card>

          <div className="flex justify-between">
            <h2 className="text-4xl font-bold">Cadastro</h2>
          </div>

          <div>

            <Input
              label="Nome"
              value={nome}
              onChange={setNome}
              type="text"
              placeholder="Digite seu nome"
            />
            <Input
              label="Email"
              value={email}
              onChange={setEmail}
              type="email"
              placeholder="Digite seu email"
            />

            <Input
              label="CPF"
              value={cpf}
              onChange={setCpf}
              type="text"
              placeholder="Digite seu CPF"
            />

            <Input
              label="Senha"
              value={senha}
              onChange={setSenha}
              type="password"
              placeholder="Digite sua senha"
            />
            <Input
              label="Conf Senha"
              value={confSenha}
              onChange={setConfSenha}
              type="password"
              placeholder="Digite sua confirmação da senha"
            />
          </div>


          <div className="mt-6">
            <button onClick={() => preCadastro()} className="btn btn-primary btn-block">Criar</button>
          </div>
          <div className="mt-6">
            <button onClick={() => setSingupOpen(false)} className="btn btn-error btn-block">Voltar</button>
          </div>
        </Card>
      </div>
    </div>
  );
}
