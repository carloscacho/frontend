'use client'
import { useState, useEffect, useRef } from "react"
import { useAlerta } from "@/context/AlertContext"

import TextInputWithButton from "@/app/_components/utils/TextInputWithButton"
import { getAllRecords, createRecord, deleteRecord, updateRecord } from "@/utils/crud"
import { filterItems } from "@/utils/filter"
import ListItens from "@/app/_components/displays/ListItens"
import Hero from "@/app/_components/displays/Hero"
import PageContainer from "@/app/_components/displays/PageContainer"
import ConfirmDialog from "@/app/_components/displays/ConfirmDialog"

export default function Page() {
  const [turmas, setTurmas] = useState([])
  const [turmasF, setTurmasF] = useState([])
  const [novaTurma, setNovaTurma] = useState("")
  const { mostrarAlerta } = useAlerta()
  const [idToDelete, setIdToDelete] = useState(null)
  const deleteModalRef = useRef(null)

  useEffect(() => {
    async function getAllTurmas() {
      const turmasApi = await getAllRecords('/turma')
      setTurmas(turmasApi)
      setTurmasF(turmasApi)
    }
    getAllTurmas()
  }, [])

  function normalizarLista(lista) {
    return lista.map(item => ({ id: item.id_turma, nome: item.nome }))
  }

  async function handleCadastrar() {
    if (!novaTurma) return;
    try {
      await createRecord('/turma', { nome: novaTurma });
      setNovaTurma("");
      const turmasApi = await getAllRecords('/turma');
      setTurmas(turmasApi);
      setTurmasF(turmasApi);
      mostrarAlerta("success", "Turma cadastrada com sucesso!");
    } catch (error) {
      mostrarAlerta("error", "Erro ao cadastrar turma.");
    }
  }

  function openDeleteModal(id) {
    setIdToDelete(id);
    deleteModalRef.current.showModal();
  }

  async function confirmDelete() {
    if (!idToDelete) return;
    try {
      await deleteRecord('/turma', idToDelete);
      const turmasApi = await getAllRecords('/turma');
      setTurmas(turmasApi);
      setTurmasF(turmasApi);
      mostrarAlerta("success", "Turma deletada com sucesso!");
      deleteModalRef.current.close();
    } catch (error) {
      mostrarAlerta("error", "Erro ao deletar turma.");
    }
  }

  async function handleEdit(id, data) {
    try {
      await updateRecord('/turma', id, data);
      const turmasApi = await getAllRecords('/turma');
      setTurmas(turmasApi);
      setTurmasF(turmasApi);
      mostrarAlerta("success", "Turma atualizada com sucesso!");
    } catch (error) {
      mostrarAlerta("error", "Erro ao atualizar turma.");
    }
  }

  useEffect(() => {
    setTurmasF(turmas)
    const results = filterItems(turmas, novaTurma)
    setTurmasF(results)
  }, [novaTurma])

  return (
    <PageContainer>
      <Hero title="Cadastro de Turmas" />
      <div className="my-3 mx-2">

        <TextInputWithButton
          placeholder="Digite para pesquisar ou cadastrar"
          type='text'
          value={novaTurma}
          onChange={setNovaTurma}
          onClick={handleCadastrar}
          btnLabel='pesquisar'
          btncolor="info"
        />
      </div>
      <div>
        <ListItens info="lista de turmas cadastradas" list={normalizarLista(turmasF)} onDelete={openDeleteModal} onEdit={handleEdit} />
      </div>
      <ConfirmDialog
        refModal={deleteModalRef}
        title="Excluir Turma"
        message="Tem certeza que deseja excluir esta turma? Esta ação não pode ser desfeita."
        onConfirm={confirmDelete}
        onCancel={() => deleteModalRef.current.close()}
      />
    </PageContainer>
  )
}