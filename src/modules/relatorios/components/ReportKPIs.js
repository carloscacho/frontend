import React from 'react'

export default function ReportKPIs({ reportData, stats }) {
    return (
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
    )
}
