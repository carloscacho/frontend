import { useState, useEffect } from "react"
import { eventoService } from "@/modules/eventos/services/evento.service"
import { useAuth } from "@/shared/contexts/AuthContext"
import { useRouter } from "next/navigation"

export const useRelatoriosList = () => {
    const [eventos, setEventos] = useState([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const { usuario } = useAuth()

    useEffect(() => {
        async function fetchEventos() {
            try {
                let data = await eventoService.getAll()
                if (usuario?.tipo === 4) {
                    data = data.filter(e => e.fk_usuario_responsavel === usuario.id_usuario)
                }
                setEventos(data.reverse())
            } catch (err) {
                console.error("Erro ao carregar eventos para relatórios:", err)
            } finally {
                setLoading(false)
            }
        }
        if (usuario) {
            fetchEventos()
        }
    }, [usuario])

    const handleViewReport = (evento) => {
        router.push(`/admin/relatorios/${evento.id_evento}`)
    }

    return {
        eventos,
        loading,
        handleViewReport
    }
}
