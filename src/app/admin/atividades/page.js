'use client'
import { useState, useEffect, useRef } from "react"

import TextInputWithButton from "@/app/_components/utils/TextInputWithButton"
import { getAllRecords } from "@/utils/crud"
import { filterItems, isEmpty } from "@/utils/filter"
import ListItens from "@/app/_components/displays/ListItens"
import Hero from "@/app/_components/displays/Hero"
import PageContainer from "@/app/_components/displays/PageContainer"
import { useModal } from "@/context/ModalContext"
import Modal from "@/app/_components/displays/Modal"
import { useEventFilter } from "@/context/EventFilterContext"
// import Atividades from "@/components/Modais/Atividades"

export default function Page() {
  const [atividade, setAtividades] = useState([])
  const [atividadeF, setAtividadesF] = useState([])
  const [novaAtividade, setNovaAtividade] = useState("")

  const { eventoSelect } = useEventFilter()

  const refMdAtividades = useRef(null)
  const { refMd } = useModal()

  useEffect(() => {
    async function getAllatividade() {
      const url = isEmpty(eventoSelect) ? "/atividade" : "/atividade/full/" + eventoSelect.id_evento
      const atividadeApi = await getAllRecords(url)
      setAtividades(atividadeApi)
      setAtividadesF(atividadeApi)
    }
    getAllatividade()
  }, [eventoSelect])

  function normalizarLista(lista) {
    return lista.map(item => (
      {
        id: item.id_atividade,
        nome: item.nome,
        description: `${item.descricao} - 
        limite: ${item.limite}`
      }))
  }

  useEffect(() => {
    setAtividadesF(atividade)
    const results = filterItems(atividade, novaAtividade)
    setAtividadesF(results)
  }, [novaAtividade])

  return (
    <PageContainer>
      <Hero title="Cadastro de atividade" />
      <div className="my-3 mx-2 flex justify-between">

        <TextInputWithButton
          placeholder="Digite para pesquisar ou cadastrar"
          type='text'
          value={novaAtividade}
          onChange={setNovaAtividade}
          onClick={() => refMdAtividades.current.showModal()}
          btnLabel='pesquisar'
          btncolor="info"
        />

      </div>
      <div>
        <ListItens info="lista de atividade cadastradas"
          list={normalizarLista(atividadeF)}
        />
      </div>
      <Modal refModal={refMdAtividades}
        onClickCancelar={() => console.log("cancelando")}>
        <h3 className="font-bold text-2xl ml-2">
          Cadastrar Novos Atividades
        </h3>
        {/* <Atividades /> */}
      </Modal>
    </PageContainer>
  )
}