'use client'
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from '@/context/AuthContext'
import Login from "@/app/_components/screens/Login";
import Cadastro from "@/app/_components/screens/Cadastro";

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
