'use client'
import Button from "@/shared/components/utils/Button"
import LoadingSpinner from "@/shared/components/displays/LoadingSpinner"
import { useReportData } from "@/modules/relatorios/hooks/useReportData"
import ReportFilters from "@/modules/relatorios/components/ReportFilters"
import ReportKPIs from "@/modules/relatorios/components/ReportKPIs"
import ChartAtividades from "@/modules/relatorios/components/ChartAtividades"
import ChartVinculos from "@/modules/relatorios/components/ChartVinculos"
import ReportTable from "@/modules/relatorios/components/ReportTable"

export default function RelatorioDetalhado() {
    const {
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
    } = useReportData()

    if (loading) return <LoadingSpinner />
    if (!reportData) return <div className="text-center py-10">Relatório não encontrado.</div>

    return (
        <div className="w-full max-w-7xl mx-auto pb-10 pt-10">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-base-200 p-4 rounded-xl border border-base-300 mb-6 gap-4 no-print">
                <h2 className="text-lg font-bold text-base-content/80">Relatório do Evento</h2>
                <div className="flex flex-wrap items-center gap-2">
                    <Button onClick={handleCopyTableData} color="ghost" mode="outline" className="btn-sm text-xs">
                        Copiar Tabela
                    </Button>
                    <Button onClick={handleDownloadCSV} color="info" mode="outline" className="btn-sm text-xs">
                        Baixar CSV
                    </Button>
                    <Button onClick={handleExportReportPDF} color="primary" mode="primary" className="btn-sm text-xs" disabled={exportingPdf}>
                        {exportingPdf ? 'Gerando PDF...' : 'Exportar Relatório PDF'}
                    </Button>
                </div>
            </div>

            {/* ====== REPORT CONTENT (captured by PDF) ====== */}
            <div ref={reportContentRef} className="bg-base-100 p-4 md:p-6 rounded-xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-base-300 pb-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-primary">{reportData.evento.nome}</h1>
                        <p className="text-sm text-base-content/75 mt-1">
                            Responsável: <span className="font-semibold">{reportData.evento.responsavel}</span>
                        </p>
                    </div>
                </div>

                {/* Filter Section */}
                <ReportFilters 
                    filterOptions={filterOptions}
                    selectedTurma={selectedTurma} setSelectedTurma={setSelectedTurma}
                    selectedSemestre={selectedSemestre} setSelectedSemestre={setSelectedSemestre}
                    selectedVinculo={selectedVinculo} setSelectedVinculo={setSelectedVinculo}
                    selectedPresenca={selectedPresenca} setSelectedPresenca={setSelectedPresenca}
                    eventYear={reportData.evento.ano}
                />

                {/* KPI Cards */}
                <ReportKPIs reportData={reportData} stats={stats} />

                {/* Visual Charts Area */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <ChartAtividades 
                        atividadesComId={atividadesComId} 
                        handleDownloadChartPNG={handleDownloadChartPNG} 
                    />
                    <ChartVinculos 
                        atividadesComId={atividadesComId} 
                        handleDownloadChartPNG={handleDownloadChartPNG} 
                    />
                </div>

                {/* Data Table */}
                <ReportTable 
                    tableRef={tableRef}
                    atividadesComId={atividadesComId}
                    stats={stats}
                    handleExportTablePDF={handleExportTablePDF}
                    exportingTablePdf={exportingTablePdf}
                />
            </div>
            {/* ====== END REPORT CONTENT ====== */}
        </div>
    )
}
