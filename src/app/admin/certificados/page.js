'use client'
import { useRef } from "react"

import TextInputWithButton from "@/shared/components/utils/TextInputWithButton"
import ListItens from "@/shared/components/displays/ListItens"
import Hero from "@/shared/components/displays/Hero"
import PageContainer from "@/shared/components/displays/PageContainer"
import Modal from "@/shared/components/displays/Modal"
import { useCertificadosAdmin } from "@/modules/certificados/hooks/useCertificadosAdmin"

export default function Page() {
  const {
    isAdmin,
    certificadoF,
    novaCertificado,
    setNovaCertificado,
    normalizarLista,
  } = useCertificadosAdmin()

  const refMdCertificados = useRef(null)

  return (
    <PageContainer>
      <Hero title="Cadastro de certificado" />
      <div className="my-3 mx-2">

        <TextInputWithButton
          placeholder="Digite para pesquisar ou cadastrar"
          type='text'
          value={novaCertificado}
          onChange={setNovaCertificado}
          onClick={() => refMdCertificados.current.showModal()}
          btnLabel='pesquisar'
          hideButton={!isAdmin}
        />
      </div>
      <div>
        <ListItens info="lista de Certificados Gerados"
          list={normalizarLista(certificadoF)}
        />
      </div>
      <Modal refModal={refMdCertificados}
        onClickCancelar={() => console.log("cancelando")}>
        <h3 className="font-bold text-2xl ml-2">
          Cadastrar Novo certificado
        </h3>
        {/* <Certificados /> */}
      </Modal>
    </PageContainer>
  )
}
