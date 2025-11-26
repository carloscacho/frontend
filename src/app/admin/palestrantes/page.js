'use client'
import { useState, useEffect, useRef } from "react"

import TextInputWithButton from "@/app/_components/utils/TextInputWithButton"
import { getAllRecords } from "@/utils/crud"
import { filterItems, isEmpty } from "@/utils/filter"
import ListItens from "@/app/_components/displays/ListItens"
import Hero from "@/app/_components/displays/Hero"
import PageContainer from "@/app/_components/displays/PageContainer"
import { useModal } from "@/context/ModalContext"
import Modal from "@/app/_components/displays/Modal"
import Palestrantes from "@/app/_components/Modais/Palestrantes"
import Select from "@/app/_components/utils/Select"

export default function Page() {
  const [palestrante, setPalestrantes] = useState([])
  const [palestranteF, setPalestrantesF] = useState([])
  const [novaPalestrante, setNovaPalestrante] = useState("")

  const [eventoOptions, setEventoOptions] = useState([])
  const [eventoSelect, setEventoSelect] = useState({})

  const refMdPalestrantes = useRef(null)
  const { refMd } = useModal()

  useEffect(() => {
    async function getAllpalestrante() {
      const url = isEmpty(eventoSelect) ? "/palestrante" : "/palestrante/full/" + eventoSelect.id_evento
      const palestranteApi = await getAllRecords(url)
      setPalestrantes(palestranteApi)
      setPalestrantesF(palestranteApi)
    }
    getAllpalestrante()
  }, [eventoSelect])

  useEffect(() => {
    async function getAllEventos() {
      const eventoApi = await getAllRecords('/evento')
      setEventoOptions(eventoApi)
      if (eventoApi && eventoApi.length > 0) {
        const sortedEventos = [...eventoApi].sort((a, b) => a.id_evento - b.id_evento)
        const lastEvent = sortedEventos[sortedEventos.length - 1]
        setEventoSelect(lastEvent)
      }
    }
    getAllEventos()
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
    <PageContainer>
      <Hero title="Cadastro de palestrante" />
      <div className="my-3 mx-2 flex justify-between">

        <TextInputWithButton
          placeholder="Digite para pesquisar ou cadastrar"
          type='text'
          value={novaPalestrante}
          onChange={setNovaPalestrante}
          onClick={() => refMdPalestrantes.current.showModal()}
          btnLabel='pesquisar'
          btncolor="info"
        />

        <Select
          label="Selecione um evento"
          options={eventoOptions}
          selectValue={eventoSelect}
          onChange={setEventoSelect}
          valueKey="id_evento"
        />
      </div>
      <div>
        <ListItens info="lista de palestrante cadastradas" list={normalizarLista(palestranteF)} />
      </div>
      <Modal refModal={refMdPalestrantes} onClickCancelar={() => console.log("cancelando")}>
        <h3 className="font-bold text-2xl ml-2">Cadastrar Novos Palestrantes</h3>
        <Palestrantes />
      </Modal>
    </PageContainer>
  )
}