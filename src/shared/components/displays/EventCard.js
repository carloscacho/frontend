import React from 'react'
import Card from "@/shared/components/displays/Card"
import { dateFormateBr } from "@/shared/utils/dateUtils"
import { getEventImageUrl } from "@/shared/utils/imageUtils"

export default function EventCard({ evento, children }) {
    return (
        <Card 
            figure={
                <img 
                    src={getEventImageUrl(evento)} 
                    alt={evento.nome} 
                    className="w-full h-48 object-cover" 
                />
            }
        >
            <h2 className="card-title text-primary">{evento.nome}</h2>
            <p className="text-sm line-clamp-2">{evento.descricao || "Sem descrição disponível."}</p>
            <div className="text-xs text-base-content/60 mt-3 space-y-1">
                <p>📅 Período: {dateFormateBr(evento.inicio)} a {dateFormateBr(evento.final)}</p>
                <p>👤 Responsável: {evento.usuario_responsavel?.nome || "Não definido"}</p>
            </div>
            <div className="card-actions justify-end mt-4">
                {children}
            </div>
        </Card>
    )
}
