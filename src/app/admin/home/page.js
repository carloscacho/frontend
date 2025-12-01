'use client'
import { useState, useEffect } from "react"
import { getAllRecords } from "@/utils/crud"
import Card from "@/app/_components/displays/Card"
import PageContainer from "@/app/_components/displays/PageContainer"
import Hero from "@/app/_components/displays/Hero"
import { dateFormateBr } from "@/utils/dateUtils"

import { useRouter } from "next/navigation"
import { useEventFilter } from "@/context/EventFilterContext"

export default function AdminHome() {
    const [eventos, setEventos] = useState([])
    const router = useRouter()
    const { setEventoSelect } = useEventFilter()

    useEffect(() => {
        async function fetchEventos() {
            const data = await getAllRecords('/evento')
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
        <PageContainer>
            <Hero title="Eventos Cadastrados" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 overflow-y-auto h-[calc(100vh-200px)] bg-base-200">
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
        </PageContainer>
    )
}
