'use client'
import { useState, useEffect } from "react"

import TextInputWithButton from "@/app/_components/utils/TextInputWithButton"
import { getAllRecords } from "@/utils/crud"
import { filterItems } from "@/utils/filter"
import ListItens from "@/app/_components/displays/ListItens"

export default function Page() {
  const [salas, setSalas] = useState([])
  const [salasF, setSalasF] = useState([])
  const [novaSala, setNovaSala] = useState("")

  useEffect(() => {
    async function getAllSalas() {
      const salasApi = await getAllRecords('/sala')
      setSalas(salasApi)
      setSalasF(salasApi)
    }
    getAllSalas()
  }, [])

  function normalizarLista(lista) {
    return lista.map(item => ({id: item.id_sala, nome: item.nome }))
  }

  useEffect(() => {
    setSalasF(salas)
    const results = filterItems(salas, novaSala)
    setSalasF(results)
  }, [novaSala])

  return (
    <div className="hero min-h-screen min-w-md">
      <div className="hero-content w-full flex-col">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl text-base-300 font-bold">Cadastro de Salas</h1>
        </div>
        <div className="flex w-full justify-between">

          <div className="overflow-x-auto w-full rounded-box border border-base-content/5 bg-base-100">
            <div className="my-3 mx-2">

              <TextInputWithButton
                placeholder="Digite para pesquisar ou cadastrar"
                type='text'
                value={novaSala}
                onChange={setNovaSala}
                onClick={console.log("btn Clickado")}
                btnLabel='pesquisar'
              />
            </div>
              <div>
                <ListItens info="lista de Salas cadastradas" list={normalizarLista(salasF)} />
              </div>
          </div>
        </div>
      </div>
    </div>

  )
}