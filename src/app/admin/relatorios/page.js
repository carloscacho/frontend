'use client'
import { useState, useEffect } from "react"
import { eventoService } from "@/modules/eventos/services/evento.service"
import Card from "@/shared/components/displays/Card"
import Button from "@/shared/components/utils/Button"
import { dateFormateBr } from "@/shared/utils/dateUtils"
import { useRouter } from "next/navigation"
import { useAuth } from "@/shared/contexts/AuthContext"
import LoadingSpinner from "@/shared/components/displays/LoadingSpinner"

export default function RelatoriosHome() {
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

    const EventImage = ({ evento }) => {
        const [imgSrc, setImgSrc] = useState(`${evento.base_url || ''}${evento.slug || ''}/imagens/fundo.png`)

        const handleError = () => {
            if (imgSrc !== `${evento.base_url || ''}${evento.slug || ''}/imagens/logo.png`) {
                setImgSrc(`${evento.base_url || ''}${evento.slug || ''}/imagens/logo.png`)
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

    if (loading) {
        return <LoadingSpinner fullScreen={true} />
    }

    return (
        <div className="w-full h-[calc(100vh-4rem)] flex flex-col">
            {/* Sticky Header */}
            <div className="sticky top-24 z-20 bg-base-200 border-b border-base-300 px-6 py-4">
                <h1 className="text-3xl font-bold">Relatórios de Eventos</h1>
                <p className="text-sm text-base-content/70 mt-1">Selecione um evento para visualizar gráficos e métricas de inscrições.</p>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto bg-base-200 p-6">
                {eventos.length === 0 ? (
                    <div className="text-center py-12">
                        <h3 className="text-xl font-semibold">Nenhum evento encontrado</h3>
                        <p className="text-base-content/60 mt-2">Você não possui eventos associados sob sua responsabilidade.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
                        {eventos.map((evento) => (
                            <Card key={evento.id_evento} figure={<EventImage evento={evento} />}>
                                <h2 className="card-title text-primary">{evento.nome}</h2>
                                <p className="text-sm line-clamp-2">{evento.descricao || "Sem descrição disponível."}</p>
                                <div className="text-xs text-base-content/60 mt-3 space-y-1">
                                    <p>📅 Período: {dateFormateBr(evento.inicio)} a {dateFormateBr(evento.final)}</p>
                                    <p>👤 Responsável: {evento.usuario_responsavel?.nome || "Não definido"}</p>
                                </div>
                                <div className="card-actions justify-end mt-4">
                                    <Button onClick={() => handleViewReport(evento)} color="primary" className="btn-block m-0">
                                        Visualizar Relatório
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
