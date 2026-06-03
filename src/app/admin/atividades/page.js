'use client'
import { useRef } from "react"

import TextInputWithButton from "@/shared/components/utils/TextInputWithButton"
import SortControl from "@/shared/components/utils/SortControl"
import ListItens from "@/shared/components/displays/ListItens"
import Hero from "@/shared/components/displays/Hero"
import PageContainer from "@/shared/components/displays/PageContainer"
import Modal from "@/shared/components/displays/Modal"
import AtividadesModal from "@/modules/atividades/components/AtividadesModal"
import ConfirmDialog from "@/shared/components/displays/ConfirmDialog"
import { useAuth } from "@/shared/contexts/AuthContext"
import { useAtividades } from "@/modules/atividades/hooks/useAtividades"

export default function Page() {
  const { usuario } = useAuth()
  const isAdmin = usuario?.tipo === 1
  const isAuthorized = usuario?.tipo === 1 || usuario?.tipo === 4

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
  } = useAtividades()

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
          hideButton={!isAuthorized}
        >
          <SortControl value={sortOrder} onChange={setSortOrder} />
        </TextInputWithButton>
      </div>
      <div>
        <ListItens
          info="lista de atividade cadastradas"
          list={normalizedList}
          deleteFunction={isAuthorized ? onDelete : null}
          editFunction={isAuthorized ? (item) => {
            openEdit(item)
            refMdAtividades.current.showModal()
          } : null}
        />
      </div>
      <Modal refModal={refMdAtividades}>
        <h3 className="font-bold text-2xl ml-2">
          {isEditing ? "Editar Atividade" : "Cadastrar Novas Atividades"}
        </h3>
        <AtividadesModal
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
