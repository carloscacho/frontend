'use client'
import { useRef, useState } from "react"
import { PiUploadSimple } from "react-icons/pi"

import TextInputWithButton from "@/shared/components/utils/TextInputWithButton"
import SortControl from "@/shared/components/utils/SortControl"
import ListItens from "@/shared/components/displays/ListItens"
import Hero from "@/shared/components/displays/Hero"
import PageContainer from "@/shared/components/displays/PageContainer"
import Modal from "@/shared/components/displays/Modal"
import PalestrantesModal from "@/modules/palestrantes/components/PalestrantesModal"
import CsvPalestrantesModal from "@/modules/palestrantes/components/CsvPalestrantesModal"
import ConfirmDialog from "@/shared/components/displays/ConfirmDialog"
import Button from "@/shared/components/utils/Button"
import { useAuth } from "@/shared/contexts/AuthContext"
import { usePalestrantes } from "@/modules/palestrantes/hooks/usePalestrantes"

export default function Page() {
  const { usuario } = useAuth()
  const isAdmin = usuario?.tipo === 1

  const refMdPalestrantes = useRef(null)
  const refMdConfirmation = useRef(null)
  const refMdCsvImport = useRef(null)

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
    isEditing,
    eventoSelect,
    importCsv
  } = usePalestrantes()

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

        {/* CSV Import Button */}
        {isAdmin && eventoSelect && (
          <Button
            mode="outline"
            color="info"
            className="gap-2 m-0"
            onClick={() => refMdCsvImport.current.showModal()}
            title="Importar palestrantes via CSV"
          >
            <PiUploadSimple size={20} />
            <span className="hidden md:inline">Importar CSV</span>
          </Button>
        )}
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
        <PalestrantesModal
          onClickCancelar={() => {
            refMdPalestrantes.current.close()
            closeEdit()
          }}
          onClickSalvar={onSave}
          initialData={editingItem}
        />
      </Modal>

      <CsvPalestrantesModal
        refModal={refMdCsvImport}
        evento={eventoSelect ? { id: eventoSelect.id_evento, nome: eventoSelect.nome } : null}
        onImport={importCsv}
        onClose={() => { }}
      />

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
