'use client'
import { useState, useEffect, useRef } from "react"

import TextInputWithButton from "@/app/_components/utils/TextInputWithButton"
import { getAllRecords } from "@/utils/crud"
import { filterItems } from "@/utils/filter"
import ListItens from "@/app/_components/displays/ListItens"
import Hero from "@/app/_components/displays/Hero"
import { useModal } from "@/context/ModalContext"
import Modal from "@/app/_components/displays/Modal"
import Palestrantes from "@/app/_components/Modais/Palestrantes"

export default function Page() {
  const [palestrante, setPalestrantes] = useState([])
  const [palestranteF, setPalestrantesF] = useState([])
  const [novaPalestrante, setNovaPalestrante] = useState("")

  const refMdPalestrantes = useRef(null)
  const {refMd} = useModal()

  useEffect(() => {
    async function getAllpalestrante() {
      const palestranteApi = await getAllRecords('/palestrante')
      setPalestrantes(palestranteApi)
      setPalestrantesF(palestranteApi)
    }
    getAllpalestrante()
  }, [])

  function normalizarLista(lista) {
    return lista.map(item => ({ id: item.id_turno, nome: item.nome, description: item.email }))
  }

  useEffect(() => {
    setPalestrantesF(palestrante)
    const results = filterItems(palestrante, novaPalestrante)
    setPalestrantesF(results)
  }, [novaPalestrante])

  return (
    <Hero title="Cadastro de palestrante">
      <div className="my-3 mx-2">

        <TextInputWithButton
          placeholder="Digite para pesquisar ou cadastrar"
          type='text'
          value={novaPalestrante}
          onChange={setNovaPalestrante}
          onClick={() => refMdPalestrantes.current.showModal()}
          btnLabel='pesquisar'
          btncolor="info"
        />
      </div>
      <div>
        <ListItens info="lista de palestrante cadastradas" list={normalizarLista(palestranteF)} />
      </div>
      <Modal refModal={refMdPalestrantes} onClickCancelar={() => console.log("cancelando")}>
        <h3 className="font-bold text-2xl ml-2">Cadastrar Novos Palestrantes</h3>
        <Palestrantes />
      </Modal>
    </Hero>

  )
}