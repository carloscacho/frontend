'use client'
import { useState, useEffect } from "react"

import TextInputWithButton from "@/components/utils/TextInputWithButton"
import { getAllRecords } from "@/utils/crud"
import { filterItems } from "@/utils/filter"
import ListItens from "@/components/displays/ListItens"
import Hero from "@/components/displays/Hero"

export default function Page() {
  const [turnos, setTurnos] = useState([])
  const [turnosF, setTurnosF] = useState([])
  const [novaTurno, setNovaTurno] = useState("")

  useEffect(() => {
    async function getAllturnos() {
      const turnosApi = await getAllRecords('/turno')
      setTurnos(turnosApi)
      setTurnosF(turnosApi)
    }
    getAllturnos()
  }, [])

  function normalizarLista(lista) {
    return lista.map(item => ({ id: item.id_turno, nome: item.nome }))
  }

  useEffect(() => {
    setTurnosF(turnos)
    const results = filterItems(turnos, novaTurno)
    setTurnosF(results)
  }, [novaTurno])

  return (
    <Hero title="Cadastro de turnos">
      <div className="my-3 mx-2">

        <TextInputWithButton
          placeholder="Digite para pesquisar ou cadastrar"
          type='text'
          value={novaTurno}
          onChange={setNovaTurno}
          onClick={console.log("btn Clickado")}
          btnLabel='pesquisar'
          btncolor="info"
        />
      </div>
      <div>
        <ListItens info="lista de turnos cadastradas" list={normalizarLista(turnosF)} />
      </div>
    </Hero>

  )
}