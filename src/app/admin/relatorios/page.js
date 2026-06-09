'use client'
import Button from "@/shared/components/utils/Button"
import LoadingSpinner from "@/shared/components/displays/LoadingSpinner"
import { useRelatoriosList } from "@/modules/relatorios/hooks/useRelatoriosList"
import EventCard from "@/shared/components/displays/EventCard"
import StickyHeader from "@/shared/components/displays/StickyHeader"

export default function RelatoriosHome() {
    const { eventos, loading, handleViewReport } = useRelatoriosList()

    if (loading) {
        return <LoadingSpinner fullScreen={true} />
    }

    return (
        <div className="w-full h-[calc(100vh-4rem)] flex flex-col">
            <StickyHeader 
                title="Relatórios de Eventos" 
                description="Selecione um evento para visualizar gráficos e métricas de inscrições."
            />

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
                        <EventCard key={evento.id_evento} evento={evento}>
                            <Button onClick={() => handleViewReport(evento)} color="primary" className="m-0">
                                Visualizar Relatório
                            </Button>
                        </EventCard>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
