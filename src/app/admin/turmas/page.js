'use client'
import { useState, useEffect } from "react"

export default function Page() {
  const [turmas, setTurmas] = useState([])
  const [turmasF, setTurmasF] = useState([])
  const [novaTurma, setNovaTurma] = useState("")

  useEffect(() => {
    async function getAllTurmas() {
      const data = await fetch('http://localhost:4000/crud/turma')
      const turmasApi = await data.json()
      setTurmas(turmasApi)
      setTurmasF(turmasApi)
    }
    getAllTurmas()
  }, [])


  useEffect(() => {
    setTurmasF(turmas)
    const results = turmas.filter((turma) => turma.nome.includes(novaTurma))
    setTurmasF(results)
  }, [novaTurma])

  return (
    <div className="hero bg-base-200 min-h-screen min-w-md">
      <div className="hero-content w-full flex-col">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold">Cadastro de Turmas</h1>
        </div>
        <div className="flex w-full justify-between">

          <div className="overflow-x-auto w-full rounded-box border border-base-content/5 bg-base-100">
            <div className="card mx-auto my-5 bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
              <div className="card-body">
                <fieldset className="fieldset">
                  <label className="label text-2xl">Turma</label>
                  <input
                    value={novaTurma}
                    onChange={(event) => setNovaTurma(event.target.value)}
                    type="text"
                    className="input"
                    placeholder="Digite para pesquisar ou cadastrar"
                  />

                  <button className="btn btn-primary mt-4">Cadastrar</button>
                </fieldset>
              </div>

            </div>
            <div className="px-10 border">
            <table className="table table-pin-rows bg-blend-multiply">
              {/* head */}
              <thead>
                <tr>
                  <th>id</th>
                  <th>Turma</th>
                  <th>opções</th>
                </tr>
              </thead>
              <tbody>
                {turmasF.map((turma) => (
                  <tr key={turma.id_turma}>
                    <td>{turma.id_turma}</td>
                    <td>{turma.nome}</td>
                    <td>
                      <button className="btn btn-warning mx-1.5 mt-4">Editar</button>
                      <button className="btn btn-error mx-1.5 mt-4">Deletar</button>

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      </div>
    </div>

  )
}