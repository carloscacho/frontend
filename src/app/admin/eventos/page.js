'use client'
import { useState, useEffect, useRef } from "react"

import TextInputWithButton from "@/app/_components/utils/TextInputWithButton"
import { getAllRecords, createRecord, deleteRecord } from "@/utils/crud"
import { filterItems } from "@/utils/filter"
import ListItens from "@/app/_components/displays/ListItens"
import Hero from "@/app/_components/displays/Hero"
import PageContainer from "@/app/_components/displays/PageContainer"
import { useModal } from "@/context/ModalContext"
import Modal from "@/app/_components/displays/Modal"
import Eventos from "@/app/_components/Modais/Eventos"
import { dateFormateBr } from "@/utils/dateUtils"

export default function Page() {
  const [evento, setEventos] = useState([])
  const [eventoF, setEventosF] = useState([])
  const [novaEvento, setNovaEvento] = useState("")

  const refMdEventos = useRef(null)
  const { refMd } = useModal()

  useEffect(() => {
    getAllevento()
  }, [])

  async function getAllevento() {
    const eventoApi = await getAllRecords('/evento')
    setEventos(eventoApi)
    setEventosF(eventoApi)
  }

  const handleSave = async (data) => {
    try {
      const result = await createRecord('/evento', data);
      await getAllevento();
      refMdEventos.current.close();
    } catch (error) {
      console.error("[Eventos Page] Error creating event:", error);
      console.error("[Eventos Page] Error response:", error.response);
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteRecord('/evento', id);
      await getAllevento();
    } catch (error) {
      console.error("[Eventos Page] Error deleting event:", error);
    }
  }

  function normalizarLista(lista) {
    return lista.map(item => (
      {
        id: item.id_evento,
        nome: item.nome,
        description: `${item.ano} - 
        ${dateFormateBr(item.inicio)} - 
        ${dateFormateBr(item.final)}`
      }))
  }

  useEffect(() => {
    setEventosF(evento)
    const results = filterItems(evento, novaEvento)
    setEventosF(results)
  }, [novaEvento])

  return (
    <PageContainer>
      <Hero title="Cadastro de evento" />
      <div className="my-3 mx-2">

        <TextInputWithButton
          placeholder="Digite para pesquisar ou cadastrar"
          type='text'
          value={novaEvento}
          onChange={setNovaEvento}
          onClick={() => refMdEventos.current.showModal()}
          btnLabel='pesquisar'
          btncolor="info"
        />
      </div>
      <div>
        <ListItens info="lista de evento cadastradas"
          list={normalizarLista(eventoF)}
          deleteFunction={handleDelete}
        />
      </div>
      <Modal refModal={refMdEventos}>
        <h3 className="font-bold text-2xl ml-2">
          Cadastrar Novos Eventos
        </h3>
        <Eventos onClickCancelar={() => refMdEventos.current.close()} onClickSalvar={handleSave} />
      </Modal>
    </PageContainer>
  )
}