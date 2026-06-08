import React from 'react'
import { getSemesterLabel } from "@/shared/utils/dateUtils"

export default function ReportFilters({ 
    filterOptions, 
    selectedTurma, setSelectedTurma, 
    selectedSemestre, setSelectedSemestre, 
    selectedVinculo, setSelectedVinculo, 
    selectedPresenca, setSelectedPresenca,
    eventYear
}) {
    return (
        <div className="card bg-base-100 shadow-sm border border-base-200 p-4 mb-6 no-print" data-html2canvas-ignore="true">
            <h3 className="font-bold mb-3 text-sm uppercase text-base-content/70">Filtros de Relatório</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* Course Filter */}
                <div className="form-control">
                    <label className="label py-1"><span className="label-text font-semibold text-xs">Curso/Turma</span></label>
                    <select 
                        className="select select-bordered select-sm w-full"
                        value={selectedTurma}
                        onChange={(e) => setSelectedTurma(e.target.value)}
                        data-testid="select-turma"
                    >
                        <option value="">Todos os Cursos</option>
                        {filterOptions.turmas.map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>

                {/* Semester Filter */}
                <div className="form-control">
                    <label className="label py-1"><span className="label-text font-semibold text-xs">Ano/Semestre Entrada</span></label>
                    <select 
                        className="select select-bordered select-sm w-full"
                        value={selectedSemestre}
                        onChange={(e) => setSelectedSemestre(e.target.value)}
                        data-testid="select-semestre"
                    >
                        <option value="">Todos os Semestres</option>
                        {filterOptions.semestres.map(s => (
                            <option key={s} value={s}>{getSemesterLabel(s, eventYear)}</option>
                        ))}
                    </select>
                </div>

                {/* Vínculo Filter */}
                <div className="form-control">
                    <label className="label py-1"><span className="label-text font-semibold text-xs">Tipo de Vínculo</span></label>
                    <select 
                        className="select select-bordered select-sm w-full"
                        value={selectedVinculo}
                        onChange={(e) => setSelectedVinculo(e.target.value)}
                        data-testid="select-vinculo"
                    >
                        <option value="">Todos</option>
                        <option value="1">Aluno IFMS</option>
                        <option value="2">Professor IFMS</option>
                        <option value="3">Comunidade Externa</option>
                    </select>
                </div>

                {/* Presence Filter */}
                <div className="form-control">
                    <label className="label py-1"><span className="label-text font-semibold text-xs">Presença</span></label>
                    <select 
                        className="select select-bordered select-sm w-full"
                        value={selectedPresenca}
                        onChange={(e) => setSelectedPresenca(e.target.value)}
                        data-testid="select-presenca"
                    >
                        <option value="">Todas Inscrições</option>
                        <option value="presente">Confirmados (Presente)</option>
                        <option value="ausente">Faltantes (Ausente)</option>
                    </select>
                </div>
            </div>
        </div>
    )
}
