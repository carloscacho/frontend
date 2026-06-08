import React from 'react'
import Button from "@/shared/components/utils/Button"

export default function ReportTable({ tableRef, atividadesComId, stats, handleExportTablePDF, exportingTablePdf }) {
    return (
        <div ref={tableRef} className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
            <div className="p-4 border-b border-base-200 bg-base-100 flex justify-between items-center">
                <h3 className="font-bold text-sm uppercase text-base-content/70">Tabela de Atividades</h3>
                <Button 
                    onClick={handleExportTablePDF} 
                    color="primary" 
                    mode="outline" 
                    className="no-print m-0"
                    disabled={exportingTablePdf}
                    data-html2canvas-ignore="true"
                >
                    {exportingTablePdf ? 'Gerando...' : 'Exportar Tabela em PDF'}
                </Button>
            </div>
            <div className="overflow-x-auto w-full">
                <table className="table table-zebra w-full text-sm">
                    <thead>
                        <tr>
                            <th className="text-center w-16">ID</th>
                            <th>Atividade</th>
                            <th>Sala/Local</th>
                            <th className="text-center">Limite Vagas</th>
                            <th className="text-center">Inscritos</th>
                            <th className="text-center">Presentes</th>
                            <th className="text-center">Taxa de Presença</th>
                        </tr>
                    </thead>
                    <tbody>
                        {atividadesComId.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center py-6 text-base-content/55">
                                    Nenhuma atividade ou participante encontrado com os filtros selecionados.
                                </td>
                            </tr>
                        ) : (
                            <>
                                {atividadesComId.map((a) => {
                                    const rate = a.totalInscritos > 0 
                                        ? ((a.totalPresentes / a.totalInscritos) * 100).toFixed(1)
                                        : "0.0"
                                    return (
                                        <tr key={a.id_atividade} className="hover">
                                            <td className="text-center font-bold text-base-content/70" data-testid={`id-${a.id_atividade}`}>{a.sequentialId}</td>
                                            <td className="font-medium text-primary" data-testid={`nome-${a.id_atividade}`} title={a.nome}>
                                                {a.nome}
                                            </td>
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
                                    <td className="text-center">-</td>
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
    )
}
