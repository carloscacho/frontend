'use client'
import { useState, useEffect } from "react"
import { eventoService } from "@/modules/eventos/services/evento.service"
import { dateFormateBr } from "@/shared/utils/dateUtils"
import EventCard from "@/shared/components/displays/EventCard"
import Link from "next/link"

export default function Home() {
  const [eventos, setEventos] = useState([])

  useEffect(() => {
    async function fetchEventos() {
      const data = await eventoService.getAll()
      setEventos(data.reverse())
    }
    fetchEventos()
  }, [])

    // Event image logic is now imported from shared utils

  return (
    <div className="w-full min-h-screen bg-base-200 flex flex-col items-center py-10">
      <h1 className="text-4xl font-bold mb-8 text-primary">Eventos IFMS</h1>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {eventos.map((evento) => (
            <EventCard key={evento.id_evento} evento={evento}>
              <Link href={`/${evento.slug}`} className="btn btn-primary w-full">
                Visitar
              </Link>
            </EventCard>
          ))}
        </div>
      </div>
    </div>
  )
}
