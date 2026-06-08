import { useState, useEffect, useMemo, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { eventoService } from "@/modules/eventos/services/evento.service"
import { useAlerta } from "@/shared/contexts/AlertContext"
import { getSemesterLabel } from "@/shared/utils/dateUtils"
import { copyTableData, downloadCSV, downloadChartPNG, exportReportPDF, exportTablePDF } from "../utils/exportUtils"

export const useReportData = () => {
    const { id } = useParams()
    const router = useRouter()
    const { mostrarAlerta } = useAlerta()

    const [reportData, setReportData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [exportingPdf, setExportingPdf] = useState(false)
    const [exportingTablePdf, setExportingTablePdf] = useState(false)

    // Refs for PDF export
    const reportContentRef = useRef(null)
    const tableRef = useRef(null)

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

    // Build a sequential ID map for activities
    const atividadesComId = useMemo(() => {
        return filteredAtividades.map((a, idx) => ({
            ...a,
            sequentialId: idx + 1
        }))
    }, [filteredAtividades])

    // Overall KPI statistics
    const stats = useMemo(() => {
        let totalRegistrations = 0
        let totalPresents = 0
        const uniqueParticipants = new Set()

        atividadesComId.forEach(a => {
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
    }, [atividadesComId])

    // Handlers
    const handleCopyTableData = () => copyTableData(atividadesComId, mostrarAlerta)
    const handleDownloadCSV = () => downloadCSV(atividadesComId, reportData)
    const handleDownloadChartPNG = (svgId, filename) => downloadChartPNG(svgId, filename)
    const handleExportReportPDF = () => exportReportPDF(reportContentRef, reportData, setExportingPdf, mostrarAlerta)
    const handleExportTablePDF = () => exportTablePDF(tableRef, reportData, setExportingTablePdf, mostrarAlerta)

    return {
        reportData,
        loading,
        exportingPdf,
        exportingTablePdf,
        reportContentRef,
        tableRef,
        filterOptions,
        selectedTurma, setSelectedTurma,
        selectedSemestre, setSelectedSemestre,
        selectedVinculo, setSelectedVinculo,
        selectedPresenca, setSelectedPresenca,
        atividadesComId,
        stats,
        handleCopyTableData,
        handleDownloadCSV,
        handleDownloadChartPNG,
        handleExportReportPDF,
        handleExportTablePDF
    }
}
