'use client'
import { useState, useEffect, useRef } from "react"

import TextInputWithButton from "@/app/_components/utils/TextInputWithButton"
import { getAllRecords } from "@/utils/crud"
import { filterItems } from "@/utils/filter"
import ListItens from "@/app/_components/displays/ListItens"
import Hero from "@/app/_components/displays/Hero"
import PageContainer from "@/app/_components/displays/PageContainer"
import { useModal } from "@/context/ModalContext"
import Modal from "@/app/_components/displays/Modal"
import { dateFormateBr } from "@/utils/dateUtils"
import { useAuth } from "@/context/AuthContext"
// import Certificados from "@/components/Modais/Certificados"

export default function Page() {
  const [certificado, setCertificados] = useState([])
  const [certificadoF, setCertificadosF] = useState([])
  const [novaCertificado, setNovaCertificado] = useState("")

  const { usuario } = useAuth()
  const isAdmin = usuario?.tipo === 1

  const refMdCertificados = useRef(null)
  const { refMd } = useModal()

  useEffect(() => {
    async function getAllcertificado() {
      const certificadoApi = await getAllRecords('/evento')
      setCertificados(certificadoApi)
      setCertificadosF(certificadoApi)
    }
    getAllcertificado()
  }, [])

  function normalizarLista(lista) {
    return lista.map(item => (
      {
        id: item.id_turno,
        nome: item.nome,
        description: `${item.ano} - 
        ${dateFormateBr(item.inicio)} - 
        ${dateFormateBr(item.final)}`
      }))
  }

  useEffect(() => {
    setCertificadosF(certificado)
    const results = filterItems(certificado, novaCertificado)
    setCertificadosF(results)
  }, [novaCertificado])

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
          btncolor="info"
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