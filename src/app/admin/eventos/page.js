'use client'
import { useRef } from "react"

import TextInputWithButton from "@/app/_components/utils/TextInputWithButton"
import SortControl from "@/app/_components/utils/SortControl"
import ListItens from "@/app/_components/displays/ListItens"
import Hero from "@/app/_components/displays/Hero"
import PageContainer from "@/app/_components/displays/PageContainer"
import Modal from "@/app/_components/displays/Modal"
import Eventos from "@/app/_components/Modais/Eventos"
import ConfirmDialog from "@/app/_components/displays/ConfirmDialog"
import { dateFormateBr } from "@/utils/dateUtils"
import { useAuth } from "@/context/AuthContext"
import { useAdminCrud } from "@/hooks/useAdminCrud"

// Normalizer function to transform data for display
const normalizeEventos = (lista) => {
  return lista.map(item => ({
    id: item.id_evento,
    nome: item.nome,
    description: `${item.ano} - ${dateFormateBr(item.inicio)} - ${dateFormateBr(item.final)}`
  }))
}

export default function Page() {
  const { usuario } = useAuth()
  const isAdmin = usuario?.tipo === 1

  const refMdEventos = useRef(null)
  const refMdConfirmation = useRef(null)

  const {
    normalizedList,
    searchTerm,
    setSearchTerm,
    sortOrder,
    setSortOrder,
    handleSave,
    handleDelete,
    confirmDelete,
    cancelDelete,
    editingItem,
    openEdit,
    openCreate,
    closeEdit,
    itemToDelete,
    isEditing
  } = useAdminCrud({
    endpoint: '/evento',
    entityName: 'Evento',
    idField: 'id_evento',
    normalizer: normalizeEventos
  })

  // Wrapper for save that closes modal
  const onSave = async (data) => {
    const success = await handleSave(data)
    if (success) {
      refMdEventos.current.close()
    }
  }

  // Wrapper for delete that opens confirmation
  const onDelete = (id) => {
    handleDelete(id)
    refMdConfirmation.current.showModal()
  }

  // Wrapper for confirm delete that closes dialog
  const onConfirmDelete = async () => {
    await confirmDelete()
    refMdConfirmation.current.close()
  }

  return (
    <PageContainer>
      <Hero title="Cadastro de evento" />
      <div className="my-3 mx-2 flex justify-between items-center gap-2">
        <TextInputWithButton
          placeholder="Digite para pesquisar ou cadastrar"
          type='text'
          value={searchTerm}
          onChange={setSearchTerm}
          onClick={() => {
            openCreate(searchTerm ? { nome: searchTerm } : null)
            refMdEventos.current.showModal()
          }}
          hideButton={!isAdmin}
        >
          <SortControl value={sortOrder} onChange={setSortOrder} />
        </TextInputWithButton>
      </div>
      <div>
        <ListItens
          info="lista de evento cadastradas"
          list={normalizedList}
          deleteFunction={isAdmin ? onDelete : null}
          editFunction={isAdmin ? (item) => {
            openEdit(item)
            refMdEventos.current.showModal()
          } : null}
        />
      </div>
      <Modal refModal={refMdEventos}>
        <h3 className="font-bold text-2xl ml-2">
          {isEditing ? "Editar Evento" : "Cadastrar Novos Eventos"}
        </h3>
        <Eventos
          onClickCancelar={() => {
            refMdEventos.current.close()
            closeEdit()
          }}
          onClickSalvar={onSave}
          initialData={editingItem}
        />
      </Modal>

      <ConfirmDialog
        refModal={refMdConfirmation}
        title="Deletar Evento"
        message="Tem certeza que deseja deletar este evento?"
        onConfirm={onConfirmDelete}
        onCancel={() => {
          refMdConfirmation.current.close()
          cancelDelete()
        }}
      />
    </PageContainer>
  )
}