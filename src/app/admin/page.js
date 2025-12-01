'use client'
import { useAuth } from '@/context/AuthContext'
import Login from "@/app/_components/screens/Login";
import Cadastro from "@/app/_components/screens/Cadastro";

export default function AdminPage() {
    const { singupOpen } = useAuth()
    if (singupOpen) return <Cadastro />
    else return <Login />
}
