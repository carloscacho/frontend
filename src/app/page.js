'use client'
import { useAuth } from '@/context/AuthContext'
import Login from "@/components/screens/Login";
import Cadastro from "@/components/screens/Cadastro";

export default function Home() {
  const { singupOpen } = useAuth()
  if(singupOpen) return <Cadastro /> 
    else return <Login />
}
