'use client'
import { useRef } from "react"

import TextInputWithButton from "@/app/_components/utils/TextInputWithButton"
import SortControl from "@/app/_components/utils/SortControl"
import ListItens from "@/app/_components/displays/ListItens"
import Hero from "@/app/_components/displays/Hero"
import PageContainer from "@/app/_components/displays/PageContainer"
import Modal from "@/app/_components/displays/Modal"
import Atividades from "@/app/_components/Modais/Atividades"
import ConfirmDialog from "@/app/_components/displays/ConfirmDialog"
import { useEventFilter } from "@/context/EventFilterContext"
import { useAuth } from "@/context/AuthContext"
import { useAdminCrud } from "@/hooks/useAdminCrud"

// Normalizer function to transform data for display
const normalizeAtividades = (lista) => {
  return lista.map(item => ({
    id: item.id_atividade,
    nome: item.nome,
    description: `${item.descricao || ''} - Local: ${item.sala?.nome || 'N/A'}`
  }))
}

export default function Page() {
  const { usuario } = useAuth()
  const isAdmin = usuario?.tipo === 1
  const { eventoSelect } = useEventFilter()

  const refMdAtividades = useRef(null)
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
    endpoint: '/atividade',
    entityName: 'Atividade',
    idField: 'id_atividade',
    normalizer: normalizeAtividades,
    filterEndpoint: '/atividade/full',
    eventFilter: eventoSelect
  })

  const onSave = async (data) => {
    const success = await handleSave(data)
    if (success) {
      refMdAtividades.current.close()
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
      <Hero title="Cadastro de atividade" />
      <div className="my-3 mx-2 flex justify-between items-center gap-2">
        <TextInputWithButton
          placeholder="Digite para pesquisar ou cadastrar"
          type='text'
          value={searchTerm}
          onChange={setSearchTerm}
          onClick={() => {
            openCreate(searchTerm ? { nome: searchTerm } : null)
            refMdAtividades.current.showModal()
          }}
          hideButton={!isAdmin}
        >
          <SortControl value={sortOrder} onChange={setSortOrder} />
        </TextInputWithButton>
      </div>
      <div>
        <ListItens
          info="lista de atividade cadastradas"
          list={normalizedList}
          deleteFunction={isAdmin ? onDelete : null}
          editFunction={isAdmin ? (item) => {
            openEdit(item)
            refMdAtividades.current.showModal()
          } : null}
        />
      </div>
      <Modal refModal={refMdAtividades}>
        <h3 className="font-bold text-2xl ml-2">
          {isEditing ? "Editar Atividade" : "Cadastrar Novas Atividades"}
        </h3>
        <Atividades
          onClickCancelar={() => {
            refMdAtividades.current.close()
            closeEdit()
          }}
          onClickSalvar={onSave}
          initialData={editingItem}
        />
      </Modal>

      <ConfirmDialog
        refModal={refMdConfirmation}
        title="Deletar Atividade"
        message="Tem certeza que deseja deletar esta atividade?"
        onConfirm={onConfirmDelete}
        onCancel={() => {
          refMdConfirmation.current.close()
          cancelDelete()
        }}
      />
    </PageContainer>
  )
}