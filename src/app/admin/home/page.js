'use client'
import { useState, useEffect } from "react"
import { eventoService } from "@/modules/eventos/services/evento.service"
import Button from "@/shared/components/utils/Button"
import { useRouter } from "next/navigation"
import { useEventFilter } from "@/shared/contexts/EventFilterContext"
import { useAuth } from "@/shared/contexts/AuthContext"
import EventCard from "@/shared/components/displays/EventCard"

export default function AdminHome() {
    const [eventos, setEventos] = useState([])
    const router = useRouter()
    const { setEventoSelect } = useEventFilter()
    const { usuario } = useAuth()

    useEffect(() => {
        async function fetchEventos() {
            let data = await eventoService.getAll()
            if (usuario?.tipo === 4) {
                data = data.filter(e => e.fk_usuario_responsavel === usuario.id_usuario)
            }
            setEventos(data.reverse())
        }
        fetchEventos()
    }, [usuario])

    const handleEdit = (evento) => {
        setEventoSelect(evento)
        router.push('/admin/atividades')
    }

    const handleVisit = (evento) => {
        if (evento.base_url && evento.slug) {
            window.open(`${evento.base_url}${evento.slug}`, '_blank')
        } else {
            setEventoSelect(evento)
            router.push('/admin/eventos')
        }
    }

    // Event image logic is now imported from shared utils

    return (
        <div className="w-full h-[calc(100vh-4rem)] flex flex-col">
            {/* Sticky Header */}
            <div className="sticky top-6 z-20 bg-base-200 border-b border-base-300 px-6 py-4">
                <h1 className="text-3xl font-bold">Eventos Cadastrados</h1>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto bg-base-200 p-6 ">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
                    {eventos.map((evento) => (
                        <EventCard key={evento.id_evento} evento={evento}>
                            <Button onClick={() => handleVisit(evento)} mode="" color="primary" className="m-0">Visitar</Button>
                            <Button onClick={() => handleEdit(evento)} mode="" color="secondary" className="m-0">Editar</Button>
                        </EventCard>
                    ))}
                </div>
            </div>
        </div>
    )
}
