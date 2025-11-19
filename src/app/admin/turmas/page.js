'use client'
import { useState, useEffect } from "react"

import TextInputWithButton from "@/app/_components/utils/TextInputWithButton"
import { getAllRecords } from "@/utils/crud"
import { filterItems } from "@/utils/filter"
import ListItens from "@/app/_components/displays/ListItens"
import Hero from "@/app/_components/displays/Hero"

export default function Page() {
  const [turmas, setTurmas] = useState([])
  const [turmasF, setTurmasF] = useState([])
  const [novaTurma, setNovaTurma] = useState("")

  useEffect(() => {
    async function getAllTurmas() {
      const turmasApi = await getAllRecords('/turma')
      setTurmas(turmasApi)
      setTurmasF(turmasApi)
    }
    getAllTurmas()
  }, [])

  function normalizarLista(lista) {
    return lista.map(item => ({ id: item.id_turma, nome: item.nome }))
  }

  useEffect(() => {
    setTurmasF(turmas)
    const results = filterItems(turmas, novaTurma)
    setTurmasF(results)
  }, [novaTurma])

  return (
    <Hero title="Cadastro de Turmas">
      <div className="my-3 mx-2">

        <TextInputWithButton
          placeholder="Digite para pesquisar ou cadastrar"
          type='text'
          value={novaTurma}
          onChange={setNovaTurma}
          onClick={console.log("btn Clickado")}
          btnLabel='pesquisar'
          btncolor="info"
        />
      </div>
      <div>
        <ListItens info="lista de turmas cadastradas" list={normalizarLista(turmasF)} />
      </div>
    </Hero>

  )
}