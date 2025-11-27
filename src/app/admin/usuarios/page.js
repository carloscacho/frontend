'use client'
import { useState, useEffect, useRef } from "react"

import TextInputWithButton from "@/app/_components/utils/TextInputWithButton"
import { getAllRecords, deleteRecord } from "@/utils/crud"
import { filterItems, formatCPF } from "@/utils/filter"
import ListItens from "@/app/_components/displays/ListItens"
import Hero from "@/app/_components/displays/Hero"
import PageContainer from "@/app/_components/displays/PageContainer"
import { useModal } from "@/context/ModalContext"
import Modal from "@/app/_components/displays/Modal"
import Usuarios from "@/app/_components/Modais/Usuarios"
import ConfirmDialog from "@/app/_components/displays/ConfirmDialog"

export default function Page() {
  const [usuario, setUsuarios] = useState([])
  const [usuarioF, setUsuariosF] = useState([])
  const [novaUsuario, setNovaUsuario] = useState("")

  const tipos = ["admin", "comum", "auxiliar"]

  const refMdUsuarios = useRef(null)
  const refMdConfirmation = useRef(null)
  const { refMd } = useModal()
  const [idToDelete, setIdToDelete] = useState(null)

  useEffect(() => {
    async function getAllusuario() {
      const usuarioApi = await getAllRecords('/usuario')
      setUsuarios(usuarioApi)
      setUsuariosF(usuarioApi)
    }
    getAllusuario()
  }, [])

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
    setUsuariosF(usuario)
    const results = filterItems(usuario, novaUsuario)
    setUsuariosF(results)
  }, [novaUsuario])

  const handleDelete = (id) => {
    setIdToDelete(id);
    refMdConfirmation.current.showModal();
  }

  const confirmDelete = async () => {
    if (!idToDelete) return;
    try {
      await deleteRecord('/usuario', idToDelete);
      const usuarioApi = await getAllRecords('/usuario');
      setUsuarios(usuarioApi);
      setUsuariosF(usuarioApi);
      refMdConfirmation.current.close();
      setIdToDelete(null);
    } catch (error) {
      console.error("Error deleting usuario:", error);
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
          onClick={() => refMdUsuarios.current.showModal()}
          btnLabel='pesquisar'
          btncolor="info"
        />
      </div>
      <div>
        <ListItens info="lista de usuario cadastradas"
          list={normalizarLista(usuarioF)}
          deleteFunction={handleDelete}
        />
      </div>
      <Modal refModal={refMdUsuarios}
        onClickCancelar={() => console.log("cancelando")}>
        <h3 className="font-bold text-2xl ml-2">
          Cadastrar Novos Usuarios
        </h3>
        <Usuarios />
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