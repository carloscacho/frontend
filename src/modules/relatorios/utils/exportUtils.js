import { useAlerta } from "@/shared/contexts/AlertContext"

// Exports Table Data to Clipboard
export const copyTableData = (atividadesComId, mostrarAlerta) => {
    let tsv = "ID\tAtividade\tSala/Local\tLimite de Vagas\tInscritos\tPresentes\tTaxa de Presença (%)\n"
    atividadesComId.forEach(a => {
        const rate = a.totalInscritos > 0 ? ((a.totalPresentes / a.totalInscritos) * 100).toFixed(1) : "0.0"
        tsv += `${a.sequentialId}\t${a.nome}\t${a.sala}\t${a.limite || 'Ilimitado'}\t${a.totalInscritos}\t${a.totalPresentes}\t${rate}%\n`
    })
    navigator.clipboard.writeText(tsv)
    mostrarAlerta('success', 'Dados da tabela copiados! Cole diretamente em uma planilha.')
}

// Download Table Data as CSV
export const downloadCSV = (atividadesComId, reportData) => {
    let csv = "\uFEFFID;Atividade;Sala/Local;Limite de Vagas;Inscritos;Presentes;Taxa de Presenca (%)\n"
    atividadesComId.forEach(a => {
        const rate = a.totalInscritos > 0 ? ((a.totalPresentes / a.totalInscritos) * 100).toFixed(1) : "0.0"
        csv += `${a.sequentialId};"${a.nome}";"${a.sala}";"${a.limite || 'Ilimitado'}";${a.totalInscritos};${a.totalPresentes};${rate}\n`
    })
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.setAttribute("download", `relatorio_atividades_${reportData?.evento?.nome.replace(/\s+/g, '_')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

// Download chart as PNG image
export const downloadChartPNG = (svgId, filename) => {
    const svgEl = document.getElementById(svgId)
    if (!svgEl) return

    const svgClone = svgEl.cloneNode(true)
    // Apply computed styles inline for proper rendering
    svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    
    // Set background to white for the exported image
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('width', '100%')
    rect.setAttribute('height', '100%')
    rect.setAttribute('fill', 'white')
    svgClone.insertBefore(rect, svgClone.firstChild)

    // Inline all text styles so they render properly in the canvas
    svgClone.querySelectorAll('text').forEach(textEl => {
        textEl.setAttribute('fill', '#333')
        textEl.style.fontFamily = 'Arial, sans-serif'
    })

    const svgString = new XMLSerializer().serializeToString(svgClone)
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(svgBlob)

    const img = new Image()
    img.onload = () => {
        const canvas = document.createElement('canvas')
        const scale = 2 // Higher resolution
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        const ctx = canvas.getContext('2d')
        ctx.scale(scale, scale)
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, img.width, img.height)
        ctx.drawImage(img, 0, 0, img.width, img.height)
        
        canvas.toBlob((blob) => {
            const downloadLink = document.createElement("a")
            downloadLink.href = URL.createObjectURL(blob)
            downloadLink.download = filename
            document.body.appendChild(downloadLink)
            downloadLink.click()
            document.body.removeChild(downloadLink)
            URL.revokeObjectURL(url)
        }, 'image/png')
    }
    img.src = url
}

// Export full report as PDF using html2canvas-pro + jspdf
export const exportReportPDF = async (reportContentRef, reportData, setExportingPdf, mostrarAlerta) => {
    if (!reportContentRef.current) return
    setExportingPdf(true)
    
    try {
        const html2canvas = (await import('html2canvas-pro')).default
        const { jsPDF } = await import('jspdf')
        const element = reportContentRef.current

        const canvas = await html2canvas(element, { 
            scale: 2, 
            useCORS: true,
            letterRendering: true,
            scrollY: 0,
            windowWidth: element.scrollWidth
        })

        const imgData = canvas.toDataURL('image/jpeg', 0.98)
        const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' })
        
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = pdf.internal.pageSize.getHeight()
        const margin = 10
        const usableWidth = pdfWidth - (margin * 2)
        const imgHeightInPdf = (canvas.height * usableWidth) / canvas.width
        
        let heightLeft = imgHeightInPdf
        let position = 0
        const usablePdfHeight = pdfHeight - (margin * 2)
        
        pdf.addImage(imgData, 'JPEG', margin, position + margin, usableWidth, imgHeightInPdf)
        heightLeft -= usablePdfHeight
        
        while (heightLeft > 0) {
            position = position - usablePdfHeight
            pdf.addPage()
            pdf.addImage(imgData, 'JPEG', margin, position + margin, usableWidth, imgHeightInPdf)
            heightLeft -= usablePdfHeight
        }

        pdf.save(`relatorio_${reportData?.evento?.nome.replace(/\s+/g, '_')}.pdf`)
        mostrarAlerta('success', 'PDF do relatório exportado com sucesso!')
    } catch (err) {
        console.error("Erro ao exportar PDF:", err)
        mostrarAlerta('error', 'Erro ao exportar PDF. Tente novamente.')
    } finally {
        setExportingPdf(false)
    }
}

// Export only the activities table as PDF
export const exportTablePDF = async (tableRef, reportData, setExportingTablePdf, mostrarAlerta) => {
    if (!tableRef.current) return
    setExportingTablePdf(true)

    try {
        const html2canvas = (await import('html2canvas-pro')).default
        const { jsPDF } = await import('jspdf')
        const element = tableRef.current

        const canvas = await html2canvas(element, { 
            scale: 2, 
            useCORS: true,
            letterRendering: true,
            scrollY: 0,
            windowWidth: element.scrollWidth
        })

        const imgData = canvas.toDataURL('image/jpeg', 0.98)
        const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' })
        
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = pdf.internal.pageSize.getHeight()
        const margin = 10
        const usableWidth = pdfWidth - (margin * 2)
        const imgHeightInPdf = (canvas.height * usableWidth) / canvas.width
        
        let heightLeft = imgHeightInPdf
        let position = 0
        const usablePdfHeight = pdfHeight - (margin * 2)
        
        pdf.addImage(imgData, 'JPEG', margin, position + margin, usableWidth, imgHeightInPdf)
        heightLeft -= usablePdfHeight
        
        while (heightLeft > 0) {
            position = position - usablePdfHeight
            pdf.addPage()
            pdf.addImage(imgData, 'JPEG', margin, position + margin, usableWidth, imgHeightInPdf)
            heightLeft -= usablePdfHeight
        }

        pdf.save(`tabela_atividades_${reportData?.evento?.nome.replace(/\s+/g, '_')}.pdf`)
        mostrarAlerta('success', 'PDF da tabela exportado com sucesso!')
    } catch (err) {
        console.error("Erro ao exportar PDF da tabela:", err)
        mostrarAlerta('error', 'Erro ao exportar PDF da tabela. Tente novamente.')
    } finally {
        setExportingTablePdf(false)
    }
}
