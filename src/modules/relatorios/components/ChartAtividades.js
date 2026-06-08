import React from 'react'
import Button from "@/shared/components/utils/Button"

export default function ChartAtividades({ atividadesComId, handleDownloadChartPNG }) {
    const height = 300
    const width = 600
    const padding = 50
    const chartHeight = height - 2 * padding
    const chartWidth = width - 2 * padding

    const maxVal = Math.max(...atividadesComId.map(a => Math.max(a.totalInscritos, 1)), 5)

    return (
        <div className="card bg-base-100 shadow-sm border border-base-200 p-4 md:col-span-2">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm uppercase text-base-content/70">Atividades: Inscrições vs Presenças</h3>
                <div className="flex items-center gap-4 text-xs no-print" data-html2canvas-ignore="true">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-[#4ade80] rounded-sm"></div>
                        <span>Inscritos</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-[#fcd34d] rounded-sm"></div>
                        <span>Presentes</span>
                    </div>
                    <Button 
                        onClick={() => handleDownloadChartPNG('chart-activities', 'grafico_atividades.png')} 
                        color="primary" 
                        mode="outline" 
                        className="no-print m-0"
                    >
                        PNG ↓
                    </Button>
                </div>
            </div>
            {atividadesComId.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-sm text-base-content/50">
                    Nenhuma atividade para exibir.
                </div>
            ) : (
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

                    {atividadesComId.map((a, idx) => {
                        const barWidth = chartWidth / (atividadesComId.length || 1)
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
                                    className="text-[10px] fill-base-content font-bold"
                                >
                                    {a.sequentialId}
                                </text>
                                <title>{`#${a.sequentialId} - ${a.nome}: ${a.totalInscritos} inscritos, ${a.totalPresentes} presentes`}</title>
                            </g>
                        )
                    })}
                </svg>
            )}
        </div>
    )
}
