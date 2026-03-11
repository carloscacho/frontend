'use client'
import Button from "@/shared/components/utils/Button"
import Input from "@/shared/components/utils/Input"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useAlerta } from "@/shared/contexts/AlertContext"

export default function RecoverPassFrom({ redirectPath }) {
    const router = useRouter();
    const [cpf, setCpf] = useState('')
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const { mostrarAlerta } = useAlerta()

    const handleRecover = async () => {
        if (!cpf && !email) {
            mostrarAlerta('error', 'Por favor, informe seu CPF ou Email.')
            return
        }

        setLoading(true)
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4455'
            const resetUrlPrefix = `${window.location.origin}${window.location.pathname}/reset`

            const res = await fetch(`${apiUrl}/usuario/request-password-reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cpfOrEmail: cpf || email,
                    resetUrlPrefix
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Erro ao solicitar recuperação de senha.')
            }

            mostrarAlerta('success', data.message || 'E-mail de recuperação enviado com sucesso!')
        } catch (error) {
            mostrarAlerta('error', error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-md mx-auto py-8 px-4 w-full">
            <div className="card bg-base-100 shadow-xl border border-base-200">
                <div className="card-body">
                    <h2 className="card-title justify-center mb-6 text-3xl font-bold uppercase text-primary">Recuperar Senha</h2>
                    <p className="text-center mb-6">Digite seu CPF ou Email para recuperar sua senha</p>
                    <div className="mt-4">
                        <Input
                            label="CPF"
                            type="text"
                            placeholder="cpf"
                            value={cpf}
                            onChange={(val) => setCpf(val.replace(/\D/g, ''))}
                        />
                        <p className="divider my-4">OU</p>
                        <Input
                            label="Email"
                            type="text"
                            placeholder="email"
                            value={email}
                            onChange={setEmail}
                        />
                    </div>
                    <Button
                        onClick={handleRecover}
                        className="btn-block"
                        mode="primary"
                        disabled={loading}
                    >
                        {loading ? 'Enviando...' : 'Recuperar Senha'}
                    </Button>
                    <Button
                        onClick={() => router.push(redirectPath)}
                        className="btn-block"
                        mode="outline"
                        color="warning"
                    >
                        Voltar para o login
                    </Button>
                </div>
            </div>
        </div>
    )
}