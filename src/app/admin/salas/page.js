'use client'
import { useRef } from "react"

import TextInputWithButton from "@/app/_components/utils/TextInputWithButton"
import ListItens from "@/app/_components/displays/ListItens"
import Hero from "@/app/_components/displays/Hero"
import PageContainer from "@/app/_components/displays/PageContainer"
import ConfirmDialog from "@/app/_components/displays/ConfirmDialog"
import { useAuth } from "@/context/AuthContext"
import { useAdminCrud } from "@/hooks/useAdminCrud"

// Normalizer function
const normalizeSalas = (lista) => {
  return lista.map(item => ({ id: item.id_sala, nome: item.nome }))
}

export default function Page() {
  const { usuario } = useAuth()
  const isAdmin = usuario?.tipo === 1
  const deleteModalRef = useRef(null)

  const {
    normalizedList,
    searchTerm,
    setSearchTerm,
    handleSave,
    handleUpdate,
    handleDelete,
    confirmDelete,
    cancelDelete
  } = useAdminCrud({
    endpoint: '/sala',
    entityName: 'Sala',
    idField: 'id_sala',
    normalizer: normalizeSalas
  })

  const handleCadastrar = async () => {
    if (!searchTerm) return
    const success = await handleSave({ nome: searchTerm })
    if (success) {
      setSearchTerm("")
    }
  }

  const onDelete = (id) => {
    handleDelete(id)
    deleteModalRef.current.showModal()
  }

  const onConfirmDelete = async () => {
    await confirmDelete()
    deleteModalRef.current.close()
  }

  const handleEdit = async (id, data) => {
    await handleUpdate(id, data)
  }

  return (
    <PageContainer>
      <Hero title="Cadastro de Salas" />
      <div className="my-3 mx-2">
        <TextInputWithButton
          placeholder="Digite para pesquisar ou cadastrar"
          type='text'
          value={searchTerm}
          onChange={setSearchTerm}
          onClick={handleCadastrar}
          btnLabel='pesquisar'
          hideButton={!isAdmin}
        />
      </div>
      <div>
        <ListItens
          info="lista de Salas cadastradas"
          list={normalizedList}
          deleteFunction={isAdmin ? onDelete : null}
          onEdit={isAdmin ? handleEdit : null}
        />
      </div>
      <ConfirmDialog
        refModal={deleteModalRef}
        title="Excluir Sala"
        message="Tem certeza que deseja excluir esta sala? Esta ação não pode ser desfeita."
        onConfirm={onConfirmDelete}
        onCancel={() => {
          deleteModalRef.current.close()
          cancelDelete()
        }}
      />
    </PageContainer>
  )
}