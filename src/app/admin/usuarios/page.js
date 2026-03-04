'use client'
import { useRef } from "react"

import TextInputWithButton from "@/shared/components/utils/TextInputWithButton"
import SortControl from "@/shared/components/utils/SortControl"
import ListItens from "@/shared/components/displays/ListItens"
import Hero from "@/shared/components/displays/Hero"
import PageContainer from "@/shared/components/displays/PageContainer"
import Modal from "@/shared/components/displays/Modal"
import UsuariosModal from "@/modules/usuarios/components/UsuariosModal"
import RoleChangeModal from "@/modules/usuarios/components/RoleChangeModal"
import ConfirmDialog from "@/shared/components/displays/ConfirmDialog"
import { useUsuarios } from "@/modules/usuarios/hooks/useUsuarios"

export default function Page() {
  const {
    isAdmin,
    usuarioF,
    novaUsuario,
    setNovaUsuario,
    sortOrder,
    setSortOrder,
    normalizarLista,
    idToDelete,
    setIdToDelete,
    confirmDelete,
    userToChangeRole,
    setUserToChangeRole,
    handleRoleClick,
    saveRoleChange,
  } = useUsuarios()

  const refMdUsuarios = useRef(null)
  const refMdRole = useRef(null)
  const refMdConfirmation = useRef(null)

  const onConfirmDelete = () => {
    confirmDelete(() => refMdConfirmation.current.close());
  };

  const onRoleSave = (id, roleName) => {
    saveRoleChange(id, roleName, () => refMdRole.current.close());
  };

  const clickDelete = (id) => {
    setIdToDelete(id);
    refMdConfirmation.current.showModal();
  };

  const clickRole = (item) => {
    handleRoleClick(item, () => refMdRole.current.showModal());
  };

  return (
    <PageContainer>
      <Hero title="Cadastro de usuario" />
      <div className="my-3 mx-2 flex justify-between items-center gap-2">

        <TextInputWithButton
          placeholder="Digite para pesquisar ou cadastrar"
          type='text'
          value={novaUsuario}
          onChange={setNovaUsuario}
          onClick={() => {
            refMdUsuarios.current.showModal();
          }}
          btnLabel='pesquisar'
          hideButton={!isAdmin}
        >
          <SortControl value={sortOrder} onChange={setSortOrder} />
        </TextInputWithButton>
      </div>
      <div>
        <ListItens info="lista de usuario cadastradas"
          list={normalizarLista(usuarioF)}
          deleteFunction={isAdmin ? clickDelete : null}
          roleFunction={isAdmin ? clickRole : null}
        />
      </div>
      <Modal refModal={refMdUsuarios}
        onClickCancelar={() => console.log("cancelando")}>
        <h3 className="font-bold text-2xl ml-2">
          Cadastrar Novos Usuarios
        </h3>
        <UsuariosModal />
      </Modal>

      <Modal refModal={refMdRole}>
        <RoleChangeModal
          user={userToChangeRole}
          onSave={onRoleSave}
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
        onConfirm={onConfirmDelete}
        onCancel={() => {
          refMdConfirmation.current.close()
          setIdToDelete(null)
        }}
      />
    </PageContainer>
  )
}
