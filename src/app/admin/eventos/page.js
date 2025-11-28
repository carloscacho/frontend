'use client'
import { useState, useEffect, useRef } from "react"

import TextInputWithButton from "@/app/_components/utils/TextInputWithButton"
import { getAllRecords, createRecord, deleteRecord, updateRecord } from "@/utils/crud"
import { filterItems } from "@/utils/filter"
import ListItens from "@/app/_components/displays/ListItens"
import Hero from "@/app/_components/displays/Hero"
import PageContainer from "@/app/_components/displays/PageContainer"
import { useModal } from "@/context/ModalContext"
import Modal from "@/app/_components/displays/Modal"
import Eventos from "@/app/_components/Modais/Eventos"
import ConfirmDialog from "@/app/_components/displays/ConfirmDialog"
import { dateFormateBr } from "@/utils/dateUtils"
import { useAuth } from "@/context/AuthContext"
import { useAlerta } from "@/context/AlertContext"

export default function Page() {
  const [evento, setEventos] = useState([])
  const [eventoF, setEventosF] = useState([])
  const [novaEvento, setNovaEvento] = useState("")
  const [editingEvent, setEditingEvent] = useState(null)
  const [itemToDelete, setItemToDelete] = useState(null)

  const { usuario } = useAuth()
  const isAdmin = usuario?.tipo === 1
  const { mostrarAlerta } = useAlerta()

  const refMdEventos = useRef(null)
  const refMdConfirmation = useRef(null)
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
      if (editingEvent) {
        await updateRecord('/evento', editingEvent.id_evento, data);
        mostrarAlerta("success", "Evento atualizado com sucesso!");
      } else {
        const result = await createRecord('/evento', data);
        mostrarAlerta("success", "Evento criado com sucesso!");
      }
      await getAllevento();
      refMdEventos.current.close();
      setEditingEvent(null);
    } catch (error) {
      console.error("[Eventos Page] Error saving event:", error);
      console.error("[Eventos Page] Error response:", error.response);
      mostrarAlerta("error", "Erro ao salvar evento.");
    }
  }

  const handleDelete = (id) => {
    setItemToDelete(id);
    refMdConfirmation.current.showModal();
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteRecord('/evento', itemToDelete);
      mostrarAlerta("success", "Evento deletado com sucesso!");
      await getAllevento();
    } catch (error) {
      console.error("[Eventos Page] Error deleting event:", error);
      const msg = error.response?.data?.message || "Erro ao deletar evento.";
      mostrarAlerta("error", msg);
    } finally {
      refMdConfirmation.current.close();
      setItemToDelete(null);
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
          onClick={() => {
            setEditingEvent(null);
            refMdEventos.current.showModal();
          }}
          btnLabel='pesquisar'
          hideButton={!isAdmin}
        />
      </div>
      <div>
        <ListItens info="lista de evento cadastradas"
          list={normalizarLista(eventoF)}
          deleteFunction={isAdmin ? handleDelete : null}
          editFunction={isAdmin ? (item) => {
            const fullEvent = evento.find(e => e.id_evento === item.id)
            setEditingEvent(fullEvent)
            refMdEventos.current.showModal()
          } : null}
        />
      </div>
      <Modal refModal={refMdEventos}>
        <h3 className="font-bold text-2xl ml-2">
          Cadastrar Novos Eventos
        </h3>
        <Eventos
          onClickCancelar={() => {
            refMdEventos.current.close()
            setEditingEvent(null)
          }}
          onClickSalvar={handleSave}
          initialData={editingEvent}
        />
      </Modal>

      <ConfirmDialog
        refModal={refMdConfirmation}
        title="Deletar Evento"
        message="Tem certeza que deseja deletar este evento?"
        onConfirm={confirmDelete}
        onCancel={() => {
          refMdConfirmation.current.close()
          setItemToDelete(null)
        }}
      />
    </PageContainer>
  )
}