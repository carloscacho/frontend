'use client'
import { useRef } from "react"

import TextInputWithButton from "@/shared/components/utils/TextInputWithButton"
import SortControl from "@/shared/components/utils/SortControl"
import ListItens from "@/shared/components/displays/ListItens"
import Hero from "@/shared/components/displays/Hero"
import PageContainer from "@/shared/components/displays/PageContainer"
import Modal from "@/shared/components/displays/Modal"
import EventosModal from "@/modules/eventos/components/EventosModal"
import CsvImportModal from "@/modules/eventos/components/CsvImportModal"
import ConfirmDialog from "@/shared/components/displays/ConfirmDialog"
import { useAuth } from "@/shared/contexts/AuthContext"
import { useEventos } from "@/modules/eventos/hooks/useEventos"

export default function Page() {
  const { usuario } = useAuth()
  const isAdmin = usuario?.tipo === 1

  const refMdEventos = useRef(null)
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
    itemToDelete,
    isEditing,
    selectedEventForImport,
    setSelectedEventForImport,
    importCsvAtividades
  } = useEventos()

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

  // CSV Import handlers
  const handleOpenCsvImport = (evento) => {
    setSelectedEventForImport(evento)
    refMdCsvImport.current.showModal()
  }

  const handleCloseCsvImport = () => {
    setSelectedEventForImport(null)
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
          importFunction={isAdmin ? handleOpenCsvImport : null}
        />
      </div>
      <Modal refModal={refMdEventos}>
        <h3 className="font-bold text-2xl ml-2">
          {isEditing ? "Editar Evento" : "Cadastrar Novos Eventos"}
        </h3>
        <EventosModal
          onClickCancelar={() => {
            refMdEventos.current.close()
            closeEdit()
          }}
          onClickSalvar={onSave}
          initialData={editingItem}
        />
      </Modal>

      <CsvImportModal
        refModal={refMdCsvImport}
        evento={selectedEventForImport}
        onImport={importCsvAtividades}
        onClose={handleCloseCsvImport}
      />

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
