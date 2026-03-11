'use client'
import Button from "@/shared/components/utils/Button"
import Input from "@/shared/components/utils/Input"
import { useRouter, useParams } from "next/navigation"
import { useState } from "react"
import { usePasswordRecovery } from "@/modules/eventos/hooks/usePasswordRecovery"

export default function RecoverPassFrom({ redirectPath }) {
    const router = useRouter();
    const { slug } = useParams();
    const [cpf, setCpf] = useState('')
    const [email, setEmail] = useState('')

    const { requestPasswordReset, loading } = usePasswordRecovery(slug);

    const handleRecover = async () => {
        const cpfOrEmail = cpf || email;
        const success = await requestPasswordReset(cpfOrEmail);

        if (success) {
            router.push(redirectPath);
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