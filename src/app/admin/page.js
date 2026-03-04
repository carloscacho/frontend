'use client'
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from '@/shared/contexts/AuthContext'
import Login from "@/shared/components/screens/Login";
import Cadastro from "@/shared/components/screens/Cadastro";

export default function AdminPage() {
    const { singupOpen, usuario } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (usuario) {
            router.push('/admin/home')
        }
    }, [usuario, router])

    if (singupOpen) return <Cadastro />
    else return <Login />
}
