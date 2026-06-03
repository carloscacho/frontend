'use client'
import { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { eventoService } from "@/modules/eventos/services/evento.service"
import Button from "@/shared/components/utils/Button"
import LoadingSpinner from "@/shared/components/displays/LoadingSpinner"
import { useAlerta } from "@/shared/contexts/AlertContext"

export default function RelatorioDetalhado() {
    const { id } = useParams()
    const router = useRouter()
    const { mostrarAlerta } = useAlerta()

    const [reportData, setReportData] = useState(null)
    const [loading, setLoading] = useState(true)

    // Filters
    const [selectedTurma, setSelectedTurma] = useState("")
    const [selectedSemestre, setSelectedSemestre] = useState("")
    const [selectedVinculo, setSelectedVinculo] = useState("")
    const [selectedPresenca, setSelectedPresenca] = useState("")

    useEffect(() => {
        async function fetchReport() {
            try {
                const data = await eventoService.getReport(Number(id))
                setReportData(data)
            } catch (err) {
                console.error("Erro ao carregar dados do relatório:", err)
                mostrarAlerta('error', err?.response?.data?.message || 'Erro ao carregar relatório.')
                router.push('/admin/relatorios')
            } finally {
                setLoading(false)
            }
        }
        if (id) {
            fetchReport()
        }
    }, [id])

    // Dynamic Lists for Filter Dropdowns
    const filterOptions = useMemo(() => {
        if (!reportData) return { turmas: [], semestres: [] }

        const turmasSet = new Set()
        const semestresSet = new Set()

        reportData.atividades.forEach(a => {
            a.participantes.forEach(p => {
                p.turmas.forEach(t => turmasSet.add(t))
                if (p.semestre) semestresSet.add(p.semestre)
            })
        })

        return {
            turmas: Array.from(turmasSet).sort(),
            semestres: Array.from(semestresSet).sort((a, b) => a - b)
        }
    }, [reportData])

    // Format semester labels based on event year
    const getSemesterLabel = (sem, currentYear = 2026) => {
        if (!sem) return ''
        if (sem === 1) return `${currentYear}-1 (1º Semestre)`
        if (sem === 2) return `${currentYear}-1 (2º Semestre)`
        if (sem === 3) return `${currentYear - 1}-1 (3º Semestre)`
        if (sem === 4) return `${currentYear - 1}-1 (4º Semestre)`
        if (sem === 5) return `${currentYear - 2}-1 (5º Semestre)`
        if (sem === 6) return `${currentYear - 2}-1 (6º Semestre)`
        return 'Turmas anteriores'
    }

    // Dynamic Filter Processing
    const filteredAtividades = useMemo(() => {
        if (!reportData) return []

        return reportData.atividades.map(ativ => {
            const filteredParticipants = ativ.participantes.filter(p => {
                // Connection Filter
                if (selectedVinculo && p.vinculo !== Number(selectedVinculo)) {
                    return false
                }

                // Presence Filter
                if (selectedPresenca) {
                    if (selectedPresenca === 'presente' && p.presenca !== 1) return false
                    if (selectedPresenca === 'ausente' && p.presenca === 1) return false
                }

                // Semester Filter
                if (selectedSemestre && p.semestre !== Number(selectedSemestre)) {
                    return false
                }

                // Course/Turma Filter
                if (selectedTurma && !p.turmas.includes(selectedTurma)) {
                    return false
                }

                return true
            })

            return {
                ...ativ,
                totalInscritos: filteredParticipants.length,
                totalPresentes: filteredParticipants.filter(p => p.presenca === 1).length,
                participantes: filteredParticipants
            }
        })
    }, [reportData, selectedTurma, selectedSemestre, selectedVinculo, selectedPresenca])

    // Overall KPI statistics
    const stats = useMemo(() => {
        let totalRegistrations = 0
        let totalPresents = 0
        const uniqueParticipants = new Set()

        filteredAtividades.forEach(a => {
            totalRegistrations += a.totalInscritos
            totalPresents += a.totalPresentes
            a.participantes.forEach(p => uniqueParticipants.add(p.fk_participante))
        })

        const presenceRate = totalRegistrations > 0 
            ? ((totalPresents / totalRegistrations) * 100).toFixed(1)
            : "0.0"

        return {
            totalRegistrations,
            totalPresents,
            uniqueParticipantsCount: uniqueParticipants.size,
            presenceRate
        }
    }, [filteredAtividades])

    // Exports
    const copyTableData = () => {
        let tsv = "Atividade\tSala/Local\tLimite de Vagas\tInscritos\tPresentes\tTaxa de Presença (%)\n"
        filteredAtividades.forEach(a => {
            const rate = a.totalInscritos > 0 ? ((a.totalPresentes / a.totalInscritos) * 100).toFixed(1) : "0.0"
            tsv += `${a.nome}\t${a.sala}\t${a.limite || 'Ilimitado'}\t${a.totalInscritos}\t${a.totalPresentes}\t${rate}%\n`
        })
        navigator.clipboard.writeText(tsv)
        mostrarAlerta('success', 'Dados da tabela copiados! Cole diretamente em uma planilha.')
    }

    const downloadCSV = () => {
        let csv = "\uFEFFAtividade;Sala/Local;Limite de Vagas;Inscritos;Presentes;Taxa de Presenca (%)\n"
        filteredAtividades.forEach(a => {
            const rate = a.totalInscritos > 0 ? ((a.totalPresentes / a.totalInscritos) * 100).toFixed(1) : "0.0"
            csv += `"${a.nome}";"${a.sala}";"${a.limite || 'Ilimitado'}";${a.totalInscritos};${a.totalPresentes};${rate}\n`
        })
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement("a")
        link.href = URL.createObjectURL(blob)
        link.setAttribute("download", `relatorio_atividades_${reportData.evento.nome.replace(/\s+/g, '_')}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const downloadChartSVG = (svgId, filename) => {
        const svgEl = document.getElementById(svgId)
        if (!svgEl) return
        const svgString = new XMLSerializer().serializeToString(svgEl)
        const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" })
        const svgUrl = URL.createObjectURL(svgBlob)
        const downloadLink = document.createElement("a")
        downloadLink.href = svgUrl;
        downloadLink.download = filename;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }

    // Chart Components
    const ChartAtividades = () => {
        const height = 300
        const width = 600
        const padding = 50
        const chartHeight = height - 2 * padding
        const chartWidth = width - 2 * padding

        const maxVal = Math.max(...filteredAtividades.map(a => Math.max(a.totalInscritos, 1)), 5)

        return (
            <svg id="chart-activities" viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#ccc" strokeWidth="1.5" />
                <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#ccc" strokeWidth="1.5" />

                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                    const y = height - padding - ratio * chartHeight
                    const labelVal = Math.round(ratio * maxVal)
                    return (
                        <g key={i}>
                            <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#eee" strokeDasharray="4" />
                            <text x={padding - 10} y={y + 4} textAnchor="end" className="text-[10px] fill-base-content/75">{labelVal}</text>
                        </g>
                    )
                })}

                {filteredAtividades.map((a, idx) => {
                    const barWidth = chartWidth / (filteredAtividades.length || 1)
                    const x = padding + idx * barWidth + barWidth * 0.15
                    const w = barWidth * 0.7

                    const hInscritos = (a.totalInscritos / maxVal) * chartHeight
                    const hPresentes = (a.totalPresentes / maxVal) * chartHeight

                    const yInscritos = height - padding - hInscritos
                    const yPresentes = height - padding - hPresentes

                    return (
                        <g key={a.id_atividade} className="group">
                            <rect 
                                x={x} 
                                y={yInscritos} 
                                width={w * 0.45} 
                                height={hInscritos} 
                                fill="#4ade80" 
                                rx="2"
                                className="transition-all duration-300 hover:opacity-85"
                            />
                            <rect 
                                x={x + w * 0.5} 
                                y={yPresentes} 
                                width={w * 0.45} 
                                height={hPresentes} 
                                fill="#fcd34d" 
                                rx="2"
                                className="transition-all duration-300 hover:opacity-85"
                            />
                            <text 
                                x={x + w / 2} 
                                y={height - padding + 15} 
                                textAnchor="middle" 
                                className="text-[8px] fill-base-content font-semibold"
                            >
                                {a.nome.length > 10 ? `${a.nome.slice(0, 8)}...` : a.nome}
                            </text>
                            <title>{`${a.nome}: ${a.totalInscritos} inscritos, ${a.totalPresentes} presentes`}</title>
                        </g>
                    )
                })}
            </svg>
        )
    }

    const ChartVinculos = () => {
        let aluno = 0, professor = 0, comunidade = 0
        filteredAtividades.forEach(a => {
            a.participantes.forEach(p => {
                if (p.vinculo === 1) aluno++
                else if (p.vinculo === 2) professor++
                else if (p.vinculo === 3) comunidade++
            })
        })

        const total = aluno + professor + comunidade
        if (total === 0) {
            return (
                <div className="flex h-full items-center justify-center text-sm text-base-content/50 py-8">
                    Nenhum participante correspondente aos filtros.
                </div>
            )
        }

        const pctA = (aluno / total) * 100
        const pctP = (professor / total) * 100
        const pctC = (comunidade / total) * 100

        const circ = 314.16
        const dashA = (pctA / 100) * circ
        const dashP = (pctP / 100) * circ
        const dashC = (pctC / 100) * circ

        const offsetA = 0
        const offsetP = dashA
        const offsetC = dashA + dashP

        return (
            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
                <svg id="chart-vinculos" viewBox="0 0 160 160" className="w-36 h-36">
                    <circle cx="80" cy="80" r="50" fill="transparent" stroke="#f3f4f6" strokeWidth="16" />
                    {aluno > 0 && (
                        <circle 
                            cx="80" cy="80" r="50" fill="transparent" 
                            stroke="#4ade80" strokeWidth="16" 
                            strokeDasharray={`${dashA} ${circ}`} 
                            strokeDashoffset={-offsetA} 
                            transform="rotate(-90 80 80)"
                        />
                    )}
                    {professor > 0 && (
                        <circle 
                            cx="80" cy="80" r="50" fill="transparent" 
                            stroke="#fcd34d" strokeWidth="16" 
                            strokeDasharray={`${dashP} ${circ}`} 
                            strokeDashoffset={-offsetP} 
                            transform="rotate(-90 80 80)"
                        />
                    )}
                    {comunidade > 0 && (
                        <circle 
                            cx="80" cy="80" r="50" fill="transparent" 
                            stroke="#3b82f6" strokeWidth="16" 
                            strokeDasharray={`${dashC} ${circ}`} 
                            strokeDashoffset={-offsetC} 
                            transform="rotate(-90 80 80)"
                        />
                    )}
                    <text x="80" y="84" textAnchor="middle" className="text-xs font-bold fill-base-content">
                        {total}
                    </text>
                </svg>
                <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#4ade80] rounded"></div>
                        <span>Alunos: <strong>{aluno}</strong> ({pctA.toFixed(0)}%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#fcd34d] rounded"></div>
                        <span>Professores: <strong>{professor}</strong> ({pctP.toFixed(0)}%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#3b82f6] rounded"></div>
                        <span>Comunidade: <strong>{comunidade}</strong> ({pctC.toFixed(0)}%)</span>
                    </div>
                </div>
            </div>
        )
    }

    if (loading) {
        return <LoadingSpinner fullScreen={true} />
    }

    if (!reportData) {
        return null
    }

    const eventYear = reportData.evento.ano || 2026

    return (
        <div className="w-full min-h-screen bg-base-200 p-6 print-container">
            {/* Styles for printing */}
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    .print-container { background: white !important; padding: 0 !important; margin: 0 !important; }
                    .card { box-shadow: none !important; border: 1px solid #e5e7eb !important; }
                    body { background: white !important; color: black !important; }
                }
            `}</style>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-base-300 pb-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-primary">{reportData.evento.nome}</h1>
                    <p className="text-sm text-base-content/75 mt-1">
                        Responsável: <span className="font-semibold">{reportData.evento.responsavel}</span>
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 no-print">
                    <Button onClick={() => window.print()} color="primary">Exportar PDF</Button>
                    <Button onClick={copyTableData} color="secondary" mode="outline">Copiar Tabela</Button>
                    <Button onClick={downloadCSV} color="accent" mode="outline">Baixar CSV</Button>
                    <Button onClick={() => router.push('/admin/relatorios')} color="neutral" mode="outline">Voltar</Button>
                </div>
            </div>

            {/* Filter Section */}
            <div className="card bg-base-100 shadow-sm border border-base-200 p-4 mb-6 no-print">
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

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="card bg-base-100 shadow-sm border border-base-200 p-4 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-primary" data-testid="kpi-evento-inscritos">{reportData.evento.totalInscritos}</span>
                    <span className="text-[10px] uppercase font-bold text-base-content/60 text-center mt-1">Inscritos Evento</span>
                </div>
                <div className="card bg-base-100 shadow-sm border border-base-200 p-4 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-primary" data-testid="kpi-atividades-totais">{reportData.atividades.length}</span>
                    <span className="text-[10px] uppercase font-bold text-base-content/60 text-center mt-1">Atividades Totais</span>
                </div>
                <div className="card bg-base-100 shadow-sm border border-base-200 p-4 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-secondary" data-testid="kpi-inscricoes-ativ">{stats.totalRegistrations}</span>
                    <span className="text-[10px] uppercase font-bold text-base-content/60 text-center mt-1">Inscrições Ativ.</span>
                </div>
                <div className="card bg-base-100 shadow-sm border border-base-200 p-4 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-success" data-testid="kpi-presencas-confirmadas">{stats.totalPresents}</span>
                    <span className="text-[10px] uppercase font-bold text-base-content/60 text-center mt-1">Presenças Confirmadas</span>
                </div>
                <div className="card bg-base-100 shadow-sm border border-base-200 p-4 flex flex-col items-center justify-center col-span-2 md:col-span-1">
                    <span className="text-2xl font-black text-info" data-testid="kpi-presenca-geral">{stats.presenceRate}%</span>
                    <span className="text-[10px] uppercase font-bold text-base-content/60 text-center mt-1">Presença Geral</span>
                </div>
            </div>

            {/* Visual Charts Area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Bar chart activity */}
                <div className="card bg-base-100 shadow-sm border border-base-200 p-4 md:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-sm uppercase text-base-content/70">Atividades: Inscrições vs Presenças</h3>
                        <div className="flex items-center gap-4 text-xs no-print">
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-[#4ade80] rounded-sm"></div>
                                <span>Inscritos</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-[#fcd34d] rounded-sm"></div>
                                <span>Presentes</span>
                            </div>
                            <button 
                                onClick={() => downloadChartSVG('chart-activities', 'grafico_atividades.svg')}
                                className="link link-primary hover:text-primary-focus ml-2"
                            >
                                SVG ↓
                            </button>
                        </div>
                    </div>
                    {filteredAtividades.length === 0 ? (
                        <div className="h-48 flex items-center justify-center text-sm text-base-content/50">
                            Nenhuma atividade para exibir.
                        </div>
                    ) : (
                        <ChartAtividades />
                    )}
                </div>

                {/* Connection Types Donut Chart */}
                <div className="card bg-base-100 shadow-sm border border-base-200 p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-sm uppercase text-base-content/70">Proporção por Vínculo</h3>
                        <button 
                            onClick={() => downloadChartSVG('chart-vinculos', 'grafico_vinculos.svg')}
                            className="link link-primary hover:text-primary-focus text-xs no-print"
                        >
                            SVG ↓
                        </button>
                    </div>
                    <ChartVinculos />
                </div>
            </div>

            {/* Data Table */}
            <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
                <div className="p-4 border-b border-base-200 bg-base-100">
                    <h3 className="font-bold text-sm uppercase text-base-content/70">Tabela de Atividades</h3>
                </div>
                <div className="overflow-x-auto w-full">
                    <table className="table table-zebra w-full text-sm">
                        <thead>
                            <tr>
                                <th>Atividade</th>
                                <th>Sala/Local</th>
                                <th className="text-center">Limite Vagas</th>
                                <th className="text-center">Inscritos</th>
                                <th className="text-center">Presentes</th>
                                <th className="text-center">Taxa de Presença</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAtividades.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-6 text-base-content/55">
                                        Nenhuma atividade ou participante encontrado com os filtros selecionados.
                                    </td>
                                </tr>
                            ) : (
                                <>
                                    {filteredAtividades.map((a) => {
                                        const rate = a.totalInscritos > 0 
                                            ? ((a.totalPresentes / a.totalInscritos) * 100).toFixed(1)
                                            : "0.0"
                                        return (
                                            <tr key={a.id_atividade} className="hover">
                                                <td className="font-medium text-primary" data-testid={`nome-${a.id_atividade}`}>{a.nome}</td>
                                                <td>{a.sala}</td>
                                                <td className="text-center">{a.limite || 'Ilimitado'}</td>
                                                <td className="text-center font-semibold" data-testid={`inscritos-${a.id_atividade}`}>{a.totalInscritos}</td>
                                                <td className="text-center font-semibold text-success" data-testid={`presentes-${a.id_atividade}`}>{a.totalPresentes}</td>
                                                <td className="text-center">
                                                    <span className={`badge ${Number(rate) >= 70 ? 'badge-success' : Number(rate) >= 40 ? 'badge-warning' : 'badge-error'} badge-outline font-bold`}>
                                                        {rate}%
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                    <tr className="bg-base-200/50 font-bold border-t-2 border-base-300">
                                        <td>TOTALIZADOR</td>
                                        <td>-</td>
                                        <td className="text-center">-</td>
                                        <td className="text-center text-secondary">{stats.totalRegistrations}</td>
                                        <td className="text-center text-success">{stats.totalPresents}</td>
                                        <td className="text-center text-info">{stats.presenceRate}%</td>
                                    </tr>
                                </>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
