'use client'
import { useState, useEffect } from "react"
import { eventoService } from "@/modules/eventos/services/evento.service"
import Card from "@/shared/components/displays/Card"
import { dateFormateBr } from "@/shared/utils/dateUtils"

import { useRouter } from "next/navigation"
import { useEventFilter } from "@/shared/contexts/EventFilterContext"

export default function AdminHome() {
    const [eventos, setEventos] = useState([])
    const router = useRouter()
    const { setEventoSelect } = useEventFilter()

    useEffect(() => {
        async function fetchEventos() {
            const data = await eventoService.getAll()
            setEventos(data.reverse())
        }
        fetchEventos()
    }, [])

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

    const EventImage = ({ evento }) => {
        const [imgSrc, setImgSrc] = useState(`${evento.base_url}${evento.slug}/imagens/fundo.png`)

        const handleError = () => {
            if (imgSrc !== `${evento.base_url}${evento.slug}/imagens/logo.png`) {
                setImgSrc(`${evento.base_url}${evento.slug}/imagens/logo.png`)
            }
        }

        return (
            <img
                src={imgSrc}
                alt={evento.nome}
                onError={handleError}
                className="w-full h-48 object-cover"
            />
        )
    }

    return (
        <div className="w-full h-[calc(100vh-4rem)] flex flex-col">
            {/* Sticky Header */}
            <div className="sticky top-24 z-20 bg-base-200 border-b border-base-300 px-6 py-4">
                <h1 className="text-3xl font-bold">Eventos Cadastrados</h1>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto bg-base-200 p-6 ">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
                    {eventos.map((evento) => (
                        <Card key={evento.id_evento} figure={<EventImage evento={evento} />}>
                            <h2 className="card-title">{evento.nome}</h2>
                            <p>{evento.descricao}</p>
                            <div className="text-sm text-gray-500 mt-2">
                                <p>Início: {dateFormateBr(evento.inicio)}</p>
                                <p>Fim: {dateFormateBr(evento.final)}</p>
                            </div>
                            <div className="card-actions justify-end mt-4">
                                <button onClick={() => handleVisit(evento)} className="btn btn-primary">Visitar</button>
                                <button onClick={() => handleEdit(evento)} className="btn btn-secondary">Editar</button>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
