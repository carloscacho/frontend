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
  const [salas, setSalas] = useState([])
  const [salasF, setSalasF] = useState([])
  const [novaSala, setNovaSala] = useState("")
  const { mostrarAlerta } = useAlerta()
  const [idToDelete, setIdToDelete] = useState(null)
  const deleteModalRef = useRef(null)

  const { usuario } = useAuth()
  const isAdmin = usuario?.tipo === 1

  useEffect(() => {
    async function getAllSalas() {
      const salasApi = await getAllRecords('/sala')
      setSalas(salasApi)
      setSalasF(salasApi)
    }
    getAllSalas()
  }, [])

  function normalizarLista(lista) {
    return lista.map(item => ({ id: item.id_sala, nome: item.nome }))
  }

  async function handleCadastrar() {
    if (!novaSala) return;
    try {
      await createRecord('/sala', { nome: novaSala });
      setNovaSala("");
      const salasApi = await getAllRecords('/sala');
      setSalas(salasApi);
      setSalasF(salasApi);
      mostrarAlerta("success", "Sala cadastrada com sucesso!");
    } catch (error) {
      mostrarAlerta("error", "Erro ao cadastrar sala.");
    }
  }

  function openDeleteModal(id) {
    setIdToDelete(id);
    deleteModalRef.current.showModal();
  }

  async function confirmDelete() {
    if (!idToDelete) return;
    try {
      await deleteRecord('/sala', idToDelete);
      const salasApi = await getAllRecords('/sala');
      setSalas(salasApi);
      setSalasF(salasApi);
      mostrarAlerta("success", "Sala deletada com sucesso!");
      deleteModalRef.current.close();
    } catch (error) {
      mostrarAlerta("error", "Erro ao deletar sala.");
    }
  }

  async function handleEdit(id, data) {
    try {
      await updateRecord('/sala', id, data);
      const salasApi = await getAllRecords('/sala');
      setSalas(salasApi);
      setSalasF(salasApi);
      mostrarAlerta("success", "Sala atualizada com sucesso!");
    } catch (error) {
      mostrarAlerta("error", "Erro ao atualizar sala.");
    }
  }

  useEffect(() => {
    setSalasF(salas)
    const results = filterItems(salas, novaSala)
    setSalasF(results)
  }, [novaSala])

  return (
    <PageContainer>
      <Hero title="Cadastro de Salas" />
      <div className="my-3 mx-2">

        <TextInputWithButton
          placeholder="Digite para pesquisar ou cadastrar"
          type='text'
          value={novaSala}
          onChange={setNovaSala}
          onClick={handleCadastrar}
          btnLabel='pesquisar'
          hideButton={!isAdmin}
        />
      </div>
      <div>
        <ListItens info="lista de Salas cadastradas" list={normalizarLista(salasF)} deleteFunction={isAdmin ? openDeleteModal : null} onEdit={isAdmin ? handleEdit : null} />
      </div>
      <ConfirmDialog
        refModal={deleteModalRef}
        title="Excluir Sala"
        message="Tem certeza que deseja excluir esta sala? Esta ação não pode ser desfeita."
        onConfirm={confirmDelete}
        onCancel={() => deleteModalRef.current.close()}
      />
    </PageContainer>
  )
}