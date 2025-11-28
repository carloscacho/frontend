'use client'
import { useState, useEffect, useRef } from "react"

import TextInputWithButton from "@/app/_components/utils/TextInputWithButton"
import { getAllRecords, deleteRecord, updateRecord } from "@/utils/crud"
import { filterItems, formatCPF } from "@/utils/filter"
import ListItens from "@/app/_components/displays/ListItens"
import Hero from "@/app/_components/displays/Hero"
import PageContainer from "@/app/_components/displays/PageContainer"
import { useModal } from "@/context/ModalContext"
import Modal from "@/app/_components/displays/Modal"
import Usuarios from "@/app/_components/Modais/Usuarios"
import RoleChangeModal from "@/app/_components/Modais/RoleChangeModal"
import ConfirmDialog from "@/app/_components/displays/ConfirmDialog"
import { useAuth } from "@/context/AuthContext"
import { useAlerta } from "@/context/AlertContext"

export default function Page() {
  const [usuarioList, setUsuarioList] = useState([])
  const [usuarioF, setUsuariosF] = useState([])
  const [novaUsuario, setNovaUsuario] = useState("")

  const { usuario, resetForm } = useAuth()
  const isAdmin = usuario?.tipo === 1
  const { mostrarAlerta } = useAlerta()

  const tipos = ["admin", "comum", "auxiliar"]

  const refMdUsuarios = useRef(null)
  const refMdRole = useRef(null)
  const refMdConfirmation = useRef(null)
  const { refMd } = useModal()
  const [idToDelete, setIdToDelete] = useState(null)
  const [userToChangeRole, setUserToChangeRole] = useState(null)

  useEffect(() => {
    getAllusuario()
  }, [])

  async function getAllusuario() {
    const usuarioApi = await getAllRecords('/usuario')
    setUsuarioList(usuarioApi)
    setUsuariosF(usuarioApi)
  }

  function normalizarLista(lista) {
    return lista.map(item => (
      {
        id: item.id_usuario,
        nome: item.nome,
        description: `${item.email} - 
        ${formatCPF(item.cpf)} - 
        ${tipos[item.tipo - 1]}`
      }))
  }

  useEffect(() => {
    setUsuariosF(usuarioList)
    const results = filterItems(usuarioList, novaUsuario)
    setUsuariosF(results)
  }, [novaUsuario, usuarioList])

  const handleDelete = (id) => {
    setIdToDelete(id);
    refMdConfirmation.current.showModal();
  }

  const confirmDelete = async () => {
    if (!idToDelete) return;
    try {
      await deleteRecord('/usuario', idToDelete);
      mostrarAlerta("success", "Usuário deletado com sucesso!");
      await getAllusuario();
    } catch (error) {
      console.error("Error deleting usuario:", error);
      const msg = error.response?.data?.message || "Erro ao deletar usuário.";
      mostrarAlerta("error", msg);
    } finally {
      refMdConfirmation.current.close();
      setIdToDelete(null);
    }
  }

  const handleRoleClick = (item) => {
    if (usuario?.tipo !== 1) {
      mostrarAlerta("error", "Apenas administradores podem alterar cargos.");
      return;
    }
    const fullUser = usuarioList.find(u => u.id_usuario === item.id);
    setUserToChangeRole(fullUser);
    refMdRole.current.showModal();
  }

  const saveRoleChange = async (id, newRole) => {
    try {
      await updateRecord('/usuario', id, { tipo: newRole });
      mostrarAlerta("success", "Cargo atualizado com sucesso!");
      await getAllusuario();
      refMdRole.current.close();
      setUserToChangeRole(null);
    } catch (error) {
      console.error("Error updating role:", error);
      mostrarAlerta("error", "Erro ao atualizar cargo.");
    }
  }

  return (
    <PageContainer>
      <Hero title="Cadastro de usuario" />
      <div className="my-3 mx-2">

        <TextInputWithButton
          placeholder="Digite para pesquisar ou cadastrar"
          type='text'
          value={novaUsuario}
          onChange={setNovaUsuario}
          onClick={() => {
            resetForm();
            refMdUsuarios.current.showModal();
          }}
          btnLabel='pesquisar'
          hideButton={!isAdmin}
        />
      </div>
      <div>
        <ListItens info="lista de usuario cadastradas"
          list={normalizarLista(usuarioF)}
          deleteFunction={isAdmin ? handleDelete : null}
          roleFunction={isAdmin ? handleRoleClick : null}
        />
      </div>
      <Modal refModal={refMdUsuarios}
        onClickCancelar={() => console.log("cancelando")}>
        <h3 className="font-bold text-2xl ml-2">
          Cadastrar Novos Usuarios
        </h3>
        <Usuarios />
      </Modal>

      <Modal refModal={refMdRole}>
        <RoleChangeModal
          user={userToChangeRole}
          onSave={saveRoleChange}
          onCancel={() => {
            refMdRole.current.close();
            setUserToChangeRole(null);
          }}
        />
      </Modal>

      <ConfirmDialog
        refModal={refMdConfirmation}
        title="Deletar Usuário"
        message="Tem certeza que deseja deletar este usuário?"
        onConfirm={confirmDelete}
        onCancel={() => {
          refMdConfirmation.current.close()
          setIdToDelete(null)
        }}
      />
    </PageContainer>
  )
}