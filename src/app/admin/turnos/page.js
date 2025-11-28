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
import { useAuth } from "@/context/AuthContext"

export default function Page() {
  const [turnos, setTurnos] = useState([])
  const [turnosF, setTurnosF] = useState([])
  const [novaTurno, setNovaTurno] = useState("")
  const { mostrarAlerta } = useAlerta()
  const [idToDelete, setIdToDelete] = useState(null)
  const deleteModalRef = useRef(null)

  const { usuario } = useAuth()
  const isAdmin = usuario?.tipo === 1

  useEffect(() => {
    async function getAllturnos() {
      const turnosApi = await getAllRecords('/turno')
      setTurnos(turnosApi)
      setTurnosF(turnosApi)
    }
    getAllturnos()
  }, [])

  function normalizarLista(lista) {
    return lista.map(item => ({ id: item.id_turno, nome: item.nome }))
  }

  async function handleCadastrar() {
    if (!novaTurno) return;
    try {
      await createRecord('/turno', { nome: novaTurno });
      setNovaTurno("");
      const turnosApi = await getAllRecords('/turno');
      setTurnos(turnosApi);
      setTurnosF(turnosApi);
      mostrarAlerta("success", "Turno cadastrado com sucesso!");
    } catch (error) {
      mostrarAlerta("error", "Erro ao cadastrar turno.");
    }
  }

  function openDeleteModal(id) {
    setIdToDelete(id);
    deleteModalRef.current.showModal();
  }

  async function confirmDelete() {
    if (!idToDelete) return;
    try {
      await deleteRecord('/turno', idToDelete);
      const turnosApi = await getAllRecords('/turno');
      setTurnos(turnosApi);
      setTurnosF(turnosApi);
      mostrarAlerta("success", "Turno deletado com sucesso!");
    } catch (error) {
      const msg = error.response?.data?.message || "Erro ao deletar turno.";
      mostrarAlerta("error", msg);
    } finally {
      deleteModalRef.current.close();
    }
  }

  async function handleEdit(id, data) {
    try {
      await updateRecord('/turno', id, data);
      const turnosApi = await getAllRecords('/turno');
      setTurnos(turnosApi);
      setTurnosF(turnosApi);
      mostrarAlerta("success", "Turno atualizado com sucesso!");
    } catch (error) {
      mostrarAlerta("error", "Erro ao atualizar turno.");
    }
  }

  useEffect(() => {
    setTurnosF(turnos)
    const results = filterItems(turnos, novaTurno)
    setTurnosF(results)
  }, [novaTurno])

  return (
    <PageContainer>
      <Hero title="Cadastro de turnos" />
      <div className="my-3 mx-2">

        <TextInputWithButton
          placeholder="Digite para pesquisar ou cadastrar"
          type='text'
          value={novaTurno}
          onChange={setNovaTurno}
          onClick={handleCadastrar}
          btnLabel='pesquisar'
          hideButton={!isAdmin}
        />
      </div>
      <div>
        <ListItens info="lista de turnos cadastradas" list={normalizarLista(turnosF)} deleteFunction={isAdmin ? openDeleteModal : null} onEdit={isAdmin ? handleEdit : null} />
      </div>
      <ConfirmDialog
        refModal={deleteModalRef}
        title="Excluir Turno"
        message="Tem certeza que deseja excluir este turno? Esta ação não pode ser desfeita."
        onConfirm={confirmDelete}
        onCancel={() => deleteModalRef.current.close()}
      />
    </PageContainer>
  )
}