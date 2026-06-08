import React from 'react'
import Button from "@/shared/components/utils/Button"

export default function ChartVinculos({ atividadesComId, handleDownloadChartPNG }) {
    let aluno = 0, professor = 0, comunidade = 0
    atividadesComId.forEach(a => {
        a.participantes.forEach(p => {
            if (p.vinculo === 1) aluno++
            else if (p.vinculo === 2) professor++
            else if (p.vinculo === 3) comunidade++
        })
    })

    const total = aluno + professor + comunidade
    const data = [
        { label: 'Alunos', value: aluno, color: '#3b82f6' },
        { label: 'Professores', value: professor, color: '#8b5cf6' },
        { label: 'Comunidade', value: comunidade, color: '#f97316' }
    ].filter(d => d.value > 0)

    let currentAngle = 0
    const cx = 150, cy = 150, r = 100

    return (
        <div className="card bg-base-100 shadow-sm border border-base-200 p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm uppercase text-base-content/70">Proporção por Vínculo</h3>
                <Button 
                    onClick={() => handleDownloadChartPNG('chart-vinculos', 'grafico_vinculos.png')} 
                    color="primary" 
                    mode="outline" 
                    className="no-print m-0"
                    data-html2canvas-ignore="true"
                >
                    PNG ↓
                </Button>
            </div>
            {total === 0 ? (
                <div className="h-48 flex items-center justify-center text-sm text-base-content/50">
                    Sem dados de vínculos.
                </div>
            ) : (
                <div className="flex flex-col items-center">
                    <svg id="chart-vinculos" viewBox="0 0 300 300" className="w-48 h-48">
                        {data.map((slice, i) => {
                            const sliceAngle = (slice.value / total) * 360
                            const startAngle = currentAngle
                            const endAngle = currentAngle + sliceAngle

                            const x1 = cx + r * Math.cos((Math.PI * (startAngle - 90)) / 180)
                            const y1 = cy + r * Math.sin((Math.PI * (startAngle - 90)) / 180)
                            const x2 = cx + r * Math.cos((Math.PI * (endAngle - 90)) / 180)
                            const y2 = cy + r * Math.sin((Math.PI * (endAngle - 90)) / 180)

                            const largeArcFlag = sliceAngle > 180 ? 1 : 0
                            const pathData = [
                                `M ${cx} ${cy}`,
                                `L ${x1} ${y1}`,
                                `A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                                'Z'
                            ].join(' ')

                            currentAngle += sliceAngle

                            return (
                                <g key={i}>
                                    <path d={pathData} fill={slice.color} className="transition-all hover:opacity-85" />
                                    <title>{`${slice.label}: ${slice.value} (${((slice.value / total) * 100).toFixed(1)}%)`}</title>
                                </g>
                            )
                        })}
                        {/* Inner circle for donut hole */}
                        <circle cx={cx} cy={cy} r={r * 0.55} fill="var(--fallback-b1,oklch(var(--b1)/1))" className="fill-base-100" />
                    </svg>
                    <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs">
                        {data.map(d => (
                            <div key={d.label} className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }}></div>
                                <span>{d.label} ({(d.value / total * 100).toFixed(1)}%)</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
