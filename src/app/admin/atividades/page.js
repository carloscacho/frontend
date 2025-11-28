'use client'
import { useState, useEffect, useRef } from "react"

import TextInputWithButton from "@/app/_components/utils/TextInputWithButton"
import { getAllRecords, createRecord, updateRecord, deleteRecord } from "@/utils/crud"
import { filterItems, isEmpty } from "@/utils/filter"
import ListItens from "@/app/_components/displays/ListItens"
import Hero from "@/app/_components/displays/Hero"
import PageContainer from "@/app/_components/displays/PageContainer"
import { useModal } from "@/context/ModalContext"
import Modal from "@/app/_components/displays/Modal"
import Atividades from "@/app/_components/Modais/Atividades"
import ConfirmDialog from "@/app/_components/displays/ConfirmDialog"
import { useEventFilter } from "@/context/EventFilterContext"
import { useAuth } from "@/context/AuthContext"
import { useAlerta } from "@/context/AlertContext"

export default function Page() {
  const [atividade, setAtividades] = useState([])
  const [atividadeF, setAtividadesF] = useState([])
  const [novaAtividade, setNovaAtividade] = useState("")
  const [editingAtividade, setEditingAtividade] = useState(null)
  const [itemToDelete, setItemToDelete] = useState(null)

  const { usuario } = useAuth()
  const isAdmin = usuario?.tipo === 1
  const { mostrarAlerta } = useAlerta()

  const { eventoSelect } = useEventFilter()

  const refMdAtividades = useRef(null)
  const refMdConfirmation = useRef(null)
  const { refMd } = useModal()

  useEffect(() => {
    getAllatividade()
  }, [eventoSelect])

  async function getAllatividade() {
    const url = isEmpty(eventoSelect) ? "/atividade/full" : "/atividade/full/" + eventoSelect.id_evento
    const atividadeApi = await getAllRecords(url)
    setAtividades(atividadeApi)
    setAtividadesF(atividadeApi)
  }

  const handleSave = async (data) => {
    try {
      if (editingAtividade) {
        await updateRecord('/atividade', editingAtividade.id_atividade, data);
        mostrarAlerta("success", "Atividade atualizada com sucesso!");
      } else {
        await createRecord('/atividade', data);
        mostrarAlerta("success", "Atividade criada com sucesso!");
      }
      await getAllatividade();
      refMdAtividades.current.close();
      setEditingAtividade(null);
    } catch (error) {
      console.error("Error saving atividade:", error);
      mostrarAlerta("error", "Erro ao salvar atividade.");
    }
  }

  const handleDelete = (id) => {
    setItemToDelete(id);
    refMdConfirmation.current.showModal();
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteRecord('/atividade', itemToDelete);
      mostrarAlerta("success", "Atividade deletada com sucesso!");
      await getAllatividade();
    } catch (error) {
      console.error("Error deleting atividade:", error);
      const msg = error.response?.data?.message || "Erro ao deletar atividade.";
      mostrarAlerta("error", msg);
    } finally {
      refMdConfirmation.current.close();
      setItemToDelete(null);
    }
  }

  function normalizarLista(lista) {
    return lista.map(item => (
      {
        id: item.id_atividade,
        nome: item.nome,
        description: `${item.descricao || ''} - Local: ${item.sala?.nome || 'N/A'}`
      }))
  }

  useEffect(() => {
    setAtividadesF(atividade)
    const results = filterItems(atividade, novaAtividade)
    setAtividadesF(results)
  }, [novaAtividade])

  return (
    <PageContainer>
      <Hero title="Cadastro de atividade" />
      <div className="my-3 mx-2 flex justify-between">

        <TextInputWithButton
          placeholder="Digite para pesquisar ou cadastrar"
          type='text'
          value={novaAtividade}
          onChange={setNovaAtividade}
          onClick={() => {
            setEditingAtividade(null);
            refMdAtividades.current.showModal();
          }}
          btnLabel='pesquisar'
          hideButton={!isAdmin}
        />

      </div>
      <div>
        <ListItens info="lista de atividade cadastradas"
          list={normalizarLista(atividadeF)}
          deleteFunction={isAdmin ? handleDelete : null}
          editFunction={isAdmin ? (item) => {
            const fullAtividade = atividade.find(a => a.id_atividade === item.id)
            setEditingAtividade(fullAtividade)
            refMdAtividades.current.showModal()
          } : null}
        />
      </div>
      <Modal refModal={refMdAtividades}>
        <h3 className="font-bold text-2xl ml-2">
          {editingAtividade ? "Editar Atividade" : "Cadastrar Novas Atividades"}
        </h3>
        <Atividades
          onClickCancelar={() => {
            refMdAtividades.current.close()
            setEditingAtividade(null)
          }}
          onClickSalvar={handleSave}
          initialData={editingAtividade}
        />
      </Modal>

      <ConfirmDialog
        refModal={refMdConfirmation}
        title="Deletar Atividade"
        message="Tem certeza que deseja deletar esta atividade?"
        onConfirm={confirmDelete}
        onCancel={() => {
          refMdConfirmation.current.close()
          setItemToDelete(null)
        }}
      />
    </PageContainer>
  )
}