'use client'
import { useState, useEffect } from "react"
import { getAllRecords } from "@/utils/crud"
import { dateFormateBr } from "@/utils/dateUtils"
import Link from "next/link"

export default function Home() {
  const [eventos, setEventos] = useState([])

  useEffect(() => {
    async function fetchEventos() {
      const data = await getAllRecords('/evento')
      setEventos(data.reverse())
    }
    fetchEventos()
  }, [])

  const EventImage = ({ evento }) => {
    const baseUrl = "http://localhost:4455"
    const imageUrl = evento.banner
      ? `${baseUrl}${evento.banner.startsWith('/') ? '' : '/'}${evento.banner}`
      : "https://placehold.co/400x200?text=Evento"

    return (
      <img
        src={imageUrl}
        alt={evento.nome}
        className="w-full h-48 object-cover"
      />
    )
  }

  return (
    <div className="w-full min-h-screen bg-base-200 flex flex-col items-center py-10">
      <h1 className="text-4xl font-bold mb-8 text-primary">Eventos IFMS</h1>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {eventos.map((evento) => (
            <div key={evento.id_evento} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <figure>
                <EventImage evento={evento} />
              </figure>
              <div className="card-body">
                <h2 className="card-title">{evento.nome}</h2>
                <p className="line-clamp-3">{evento.descricao}</p>
                <div className="text-sm text-gray-500 mt-2">
                  <p>Início: {dateFormateBr(evento.inicio)}</p>
                  <p>Fim: {dateFormateBr(evento.final)}</p>
                </div>
                <div className="card-actions justify-end mt-4">
                  <Link href={`/${evento.slug}`} className="btn btn-primary w-full">
                    Visitar
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
