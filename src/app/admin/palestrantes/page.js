'use client'
import { useRef } from "react"

import TextInputWithButton from "@/app/_components/utils/TextInputWithButton"
import SortControl from "@/app/_components/utils/SortControl"
import ListItens from "@/app/_components/displays/ListItens"
import Hero from "@/app/_components/displays/Hero"
import PageContainer from "@/app/_components/displays/PageContainer"
import Modal from "@/app/_components/displays/Modal"
import Palestrantes from "@/app/_components/Modais/Palestrantes"
import ConfirmDialog from "@/app/_components/displays/ConfirmDialog"
import { useEventFilter } from "@/context/EventFilterContext"
import { useAuth } from "@/context/AuthContext"
import { useAdminCrud } from "@/hooks/useAdminCrud"

// Normalizer function to transform data for display
const normalizePalestrantes = (lista) => {
  return lista.map(item => {
    const eventos = item.palestrante_evento?.map(pe => pe.evento.nome).join(", ") || "Nenhum evento";
    return {
      id: item.id_palestrante,
      nome: item.nome,
      description: `${item.email} - Eventos: ${eventos}`
    }
  })
}

export default function Page() {
  const { usuario } = useAuth()
  const isAdmin = usuario?.tipo === 1
  const { eventoSelect } = useEventFilter()

  const refMdPalestrantes = useRef(null)
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
    isEditing
  } = useAdminCrud({
    endpoint: '/palestrante',
    entityName: 'Palestrante',
    idField: 'id_palestrante',
    normalizer: normalizePalestrantes,
    filterEndpoint: '/palestrante/full',
    eventFilter: eventoSelect
  })

  const onSave = async (data) => {
    const success = await handleSave(data)
    if (success) {
      refMdPalestrantes.current.close()
    }
  }

  const onDelete = (id) => {
    handleDelete(id)
    refMdConfirmation.current.showModal()
  }

  const onConfirmDelete = async () => {
    await confirmDelete()
    refMdConfirmation.current.close()
  }

  return (
    <PageContainer>
      <Hero title="Cadastro de palestrante" />
      <div className="my-3 mx-2 flex justify-between items-center gap-2">
        <TextInputWithButton
          placeholder="Digite para pesquisar ou cadastrar"
          type='text'
          value={searchTerm}
          onChange={setSearchTerm}
          onClick={() => {
            openCreate(searchTerm ? { nome: searchTerm } : null)
            refMdPalestrantes.current.showModal()
          }}
          hideButton={!isAdmin}
        >
          <SortControl value={sortOrder} onChange={setSortOrder} />
        </TextInputWithButton>
      </div>
      <div>
        <ListItens
          info="lista de palestrante cadastradas"
          list={normalizedList}
          deleteFunction={isAdmin ? onDelete : null}
          editFunction={isAdmin ? (item) => {
            openEdit(item)
            refMdPalestrantes.current.showModal()
          } : null}
        />
      </div>
      <Modal refModal={refMdPalestrantes}>
        <h3 className="font-bold text-2xl ml-2">
          {isEditing ? "Editar Palestrante" : "Cadastrar Novos Palestrantes"}
        </h3>
        <Palestrantes
          onClickCancelar={() => {
            refMdPalestrantes.current.close()
            closeEdit()
          }}
          onClickSalvar={onSave}
          initialData={editingItem}
        />
      </Modal>

      <ConfirmDialog
        refModal={refMdConfirmation}
        title="Deletar Palestrante"
        message="Tem certeza que deseja deletar este palestrante?"
        onConfirm={onConfirmDelete}
        onCancel={() => {
          refMdConfirmation.current.close()
          cancelDelete()
        }}
      />
    </PageContainer>
  )
}