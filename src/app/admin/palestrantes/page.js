'use client'
import { useState, useEffect, useRef } from "react"

import TextInputWithButton from "@/app/_components/utils/TextInputWithButton"
import { filterItems, isEmpty } from "@/utils/filter"
import { sortItems } from "@/utils/sort"
import SortControl from "@/app/_components/utils/SortControl"
import ListItens from "@/app/_components/displays/ListItens"
import Hero from "@/app/_components/displays/Hero"
import PageContainer from "@/app/_components/displays/PageContainer"
import { useModal } from "@/context/ModalContext"
import Modal from "@/app/_components/displays/Modal"
import Palestrantes from "@/app/_components/Modais/Palestrantes"
import ConfirmDialog from "@/app/_components/displays/ConfirmDialog"
import { useEventFilter } from "@/context/EventFilterContext"
import { createRecord, deleteRecord, updateRecord, getAllRecords } from "@/utils/crud"
import { useAuth } from "@/context/AuthContext"
import { useAlerta } from "@/context/AlertContext"

export default function Page() {
  const [palestrante, setPalestrantes] = useState([])
  const [palestranteF, setPalestrantesF] = useState([])
  const [novaPalestrante, setNovaPalestrante] = useState("")
  const [sortOrder, setSortOrder] = useState('id-desc')
  const [editingPalestrante, setEditingPalestrante] = useState(null)
  const [idToDelete, setIdToDelete] = useState(null)

  const { usuario } = useAuth()
  const isAdmin = usuario?.tipo === 1
  const { mostrarAlerta } = useAlerta()

  const { eventoSelect } = useEventFilter()

  const refMdPalestrantes = useRef(null)
  const refMdConfirmation = useRef(null)
  const { refMd } = useModal()

  useEffect(() => {
    getAllpalestrante()
  }, [eventoSelect])

  async function getAllpalestrante() {
    const url = isEmpty(eventoSelect) ? "/palestrante" : "/palestrante/full/" + eventoSelect.id_evento
    const palestranteApi = await getAllRecords(url)
    setPalestrantes(palestranteApi)
    setPalestrantesF(palestranteApi)
  }

  const handleSave = async (data) => {
    try {
      if (editingPalestrante && editingPalestrante.id_palestrante) {
        await updateRecord('/palestrante', editingPalestrante.id_palestrante, data);
        mostrarAlerta("success", "Palestrante atualizado com sucesso!");
      } else {
        await createRecord('/palestrante', data);
        mostrarAlerta("success", "Palestrante criado com sucesso!");
      }
      await getAllpalestrante();
      refMdPalestrantes.current.close();
      setEditingPalestrante(null);
    } catch (error) {
      console.error("Error saving palestrante:", error);
      mostrarAlerta("error", "Erro ao salvar palestrante.");
    }
  }

  const handleDelete = (id) => {
    setIdToDelete(id);
    refMdConfirmation.current.showModal();
  }

  const confirmDelete = async () => {
    if (!idToDelete) return;
    try {
      await deleteRecord('/palestrante', idToDelete);
      mostrarAlerta("success", "Palestrante deletado com sucesso!");
      await getAllpalestrante();
    } catch (error) {
      console.error("Error deleting palestrante:", error);
      const msg = error.response?.data?.message || "Erro ao deletar palestrante.";
      mostrarAlerta("error", msg);
    } finally {
      refMdConfirmation.current.close();
      setIdToDelete(null);
    }
  }

  function normalizarLista(lista) {
    return lista.map(item => {
      const eventos = item.palestrante_evento?.map(pe => pe.evento.nome).join(", ") || "Nenhum evento";
      return {
        id: item.id_palestrante,
        nome: item.nome,
        description: `${item.email} - Eventos: ${eventos}`
      }
    })
  }

  useEffect(() => {
    setPalestrantesF(palestrante)
    const results = filterItems(palestrante, novaPalestrante)
    const sorted = sortItems(results, sortOrder)
    setPalestrantesF(sorted)
  }, [novaPalestrante, sortOrder, palestrante])

  return (
    <PageContainer>
      <Hero title="Cadastro de palestrante" />
      <div className="my-3 mx-2 flex justify-between items-center gap-2">

        <TextInputWithButton
          placeholder="Digite para pesquisar ou cadastrar"
          type='text'
          value={novaPalestrante}
          onChange={setNovaPalestrante}
          onClick={() => {
            setEditingPalestrante(novaPalestrante ? { nome: novaPalestrante } : null);
            refMdPalestrantes.current.showModal();
          }}
          hideButton={!isAdmin}
        >
          <SortControl value={sortOrder} onChange={setSortOrder} />
        </TextInputWithButton>
      </div>
      <div>
        <ListItens
          info="lista de palestrante cadastradas"
          list={normalizarLista(palestranteF)}
          deleteFunction={isAdmin ? handleDelete : null}
          editFunction={isAdmin ? (item) => {
            const fullPalestrante = palestrante.find(p => p.id_palestrante === item.id)
            setEditingPalestrante(fullPalestrante)
            refMdPalestrantes.current.showModal()
          } : null}
        />
      </div>
      <Modal refModal={refMdPalestrantes}>
        <h3 className="font-bold text-2xl ml-2">
          {editingPalestrante && editingPalestrante.id_palestrante ? "Editar Palestrante" : "Cadastrar Novos Palestrantes"}
        </h3>
        <Palestrantes
          onClickCancelar={() => {
            refMdPalestrantes.current.close()
            setEditingPalestrante(null)
          }}
          onClickSalvar={handleSave}
          initialData={editingPalestrante}
        />
      </Modal>

      <ConfirmDialog
        refModal={refMdConfirmation}
        title="Deletar Palestrante"
        message="Tem certeza que deseja deletar este palestrante?"
        onConfirm={confirmDelete}
        onCancel={() => {
          refMdConfirmation.current.close()
          setIdToDelete(null)
        }}
      />
    </PageContainer>
  )
}