/**
 * Utility functions for generating printable documents via hidden iframes.
 * All print functions create a styled HTML document, render it in a hidden iframe,
 * and trigger the browser's print dialog.
 */

/**
 * Core helper: prints an HTML string via a hidden iframe.
 * @param {string} html - Full HTML document string to print
 */
function printViaIframe(html) {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    iframe.contentDocument.open();
    iframe.contentDocument.write(html);
    iframe.contentDocument.close();

    iframe.contentWindow.onafterprint = () => {
        document.body.removeChild(iframe);
    };

    setTimeout(() => {
        iframe.contentWindow.print();
    }, 250);
}

/**
 * Print attendance list as a table with signature column.
 * @param {Object} options
 * @param {string} options.title - Activity name
 * @param {string} [options.subtitle] - E.g. room name
 * @param {Array<{nome: string, email: string, instituicao: string}>} options.participants
 */
export function printAttendanceList({ title, subtitle, participants }) {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Lista de Presença - ${title}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; }
                h1 { font-size: 16px; text-align: center; margin-bottom: 4px; }
                h2 { font-size: 13px; text-align: center; font-weight: normal; color: #555; margin-bottom: 16px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #333; padding: 6px 8px; text-align: left; }
                th { background-color: #f0f0f0; font-weight: bold; font-size: 11px; }
                td { font-size: 11px; }
                .signature-col { width: 25%; }
                .num-col { width: 5%; text-align: center; }
                tr:nth-child(even) { background-color: #fafafa; }
                @media print { body { padding: 10px; } }
            </style>
        </head>
        <body>
            <h1>Lista de Presença</h1>
            <h2>${title}${subtitle ? ` — ${subtitle}` : ''}</h2>
            <table>
                <thead>
                    <tr>
                        <th class="num-col">#</th>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Instituição</th>
                        <th class="signature-col">Assinatura</th>
                    </tr>
                </thead>
                <tbody>
                    ${participants.map((p, i) => `
                        <tr>
                            <td class="num-col">${i + 1}</td>
                            <td>${p.nome}</td>
                            <td>${p.email}</td>
                            <td>${p.instituicao || ''}</td>
                            <td class="signature-col"></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </body>
        </html>
    `;
    printViaIframe(html);
}

/**
 * Print activity report with session tables and participant status.
 * @param {Object} options
 * @param {Object} options.atividade - Activity object with nome, descricao, sala, data_atividade
 * @param {Function} options.calculateEndTime - Function to calculate session end time
 */
export function printActivityReport({ atividade, calculateEndTime }) {
    const sessions = atividade.data_atividade || [];
    const sessionsHtml = sessions.map(session => {
        const date = new Date(session.data);
        const formattedDate = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });
        const startTime = new Date(session.hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
        const endTime = calculateEndTime(session.data, session.hora, session.duracao);
        const participantes = session.data_atividade_participante || [];

        const rows = participantes.map((ins, i) => {
            const status = ins.presenca === 1 ? 'Presente' : ins.presenca === 0 ? 'Faltou' : 'Pendente';
            const statusColor = ins.presenca === 1 ? '#16a34a' : ins.presenca === 0 ? '#dc2626' : '#6b7280';
            return `<tr>
                <td style="text-align:center">${i + 1}</td>
                <td>${ins.participante.usuario.nome}</td>
                <td>${ins.participante.usuario.email}</td>
                <td>${ins.participante.usuario.instituicao || ''}</td>
                <td><span style="color:${statusColor};font-weight:600">${status}</span></td>
            </tr>`;
        }).join('');

        return `
            <div class="session">
                <h3>Sessão: ${formattedDate} - ${startTime} às ${endTime}
                    <span class="badge">${participantes.length} inscritos</span>
                </h3>
                <table>
                    <thead>
                        <tr>
                            <th style="width:5%;text-align:center">#</th>
                            <th>Nome</th>
                            <th>Email</th>
                            <th>Instituição</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows || '<tr><td colspan="5" style="text-align:center">Nenhum inscrito nesta sessão.</td></tr>'}
                    </tbody>
                </table>
            </div>`;
    }).join('');

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Relatório - ${atividade?.nome || 'Atividade'}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: Arial, sans-serif; padding: 24px; font-size: 12px; color: #333; }
                .header { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px 20px; margin-bottom: 20px; }
                .header h1 { font-size: 20px; margin-bottom: 4px; }
                .header p { color: #666; font-size: 12px; margin-bottom: 6px; }
                .header .local { font-weight: bold; font-size: 12px; }
                h2 { font-size: 16px; margin-bottom: 12px; }
                .session { border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 16px; overflow: hidden; }
                .session h3 { font-size: 13px; padding: 10px 16px; background: #f9fafb; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
                .badge { background: #3b82f6; color: white; border-radius: 10px; padding: 2px 10px; font-size: 11px; font-weight: 600; }
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #f0f0f0; }
                th { font-size: 11px; color: #666; font-weight: 600; }
                td { font-size: 11px; }
                tr:last-child td { border-bottom: none; }
                @media print { body { padding: 10px; } }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${atividade.nome}</h1>
                <p>${atividade.descricao || ''}</p>
                <div class="local">Local: ${atividade.sala?.nome || 'A definir'}</div>
            </div>
            <h2>Lista de Presença</h2>
            ${sessionsHtml}
        </body>
        </html>
    `;
    printViaIframe(html);
}

/**
 * Print user profile with QR code and personal info.
 * @param {Object} options
 * @param {Object} options.usuario - User object with nome, email, cpf, instituicao, comunidade
 * @param {number|string} [options.participanteId] - Participant ID
 * @param {string} [options.qrSvgSelector] - CSS selector for the QR code container (default: '.qr-print-source')
 */
export function printUserProfile({ usuario, participanteId, qrSvgSelector = '.qr-print-source' }) {
    const qrContainer = document.querySelector(qrSvgSelector);
    const qrSvg = qrContainer ? qrContainer.innerHTML : '';

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Minha Área - ${usuario.nome}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: Arial, sans-serif; padding: 30px; color: #333; }
                .container { max-width: 500px; margin: 0 auto; text-align: center; }
                h2 { font-size: 22px; margin-bottom: 20px; text-transform: uppercase; color: #6366f1; }
                .qr-section { margin: 20px auto; background: white; padding: 16px; display: inline-block; border: 1px solid #e5e7eb; border-radius: 8px; }
                .qr-section svg { width: 180px; height: 180px; }
                .info { text-align: left; margin-top: 24px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px 20px; }
                .info-row { padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
                .info-row:last-child { border-bottom: none; }
                .info-label { font-weight: bold; font-size: 13px; color: #555; }
                .info-value { font-size: 15px; margin-top: 2px; }
                .id-badge { margin-top: 8px; font-size: 12px; color: #888; }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Participante</h2>
                ${qrSvg ? `<div class="qr-section">${qrSvg}</div>` : ''}
                ${participanteId ? `<div class="id-badge">ID: ${participanteId}</div>` : ''}
                <div class="info">
                    <div class="info-row">
                        <div class="info-label">Nome</div>
                        <div class="info-value">${usuario.nome}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">E-mail</div>
                        <div class="info-value">${usuario.email}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">CPF</div>
                        <div class="info-value">${usuario.cpf}</div>
                    </div>
                    ${usuario.instituicao ? `<div class="info-row"><div class="info-label">Instituição</div><div class="info-value">${usuario.instituicao}</div></div>` : ''}
                    ${usuario.comunidade ? `<div class="info-row"><div class="info-label">Comunidade</div><div class="info-value">${usuario.comunidade}</div></div>` : ''}
                </div>
            </div>
        </body>
        </html>
    `;
    printViaIframe(html);
}
