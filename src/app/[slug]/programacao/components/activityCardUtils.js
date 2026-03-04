// Helper to darken a color for gradient
export function darkenColor(hex, percent = 20) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max((num >> 16) - amt, 0);
    const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
    const B = Math.max((num & 0x0000FF) - amt, 0);
    return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
}

// Get initials from name
export function getInitials(name) {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

// Format time for display
export function formatTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
}

// Format date for display
export function formatDateFull(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });
}

// Calculate vacancy info from activity data
export function calculateVacancyInfo(atividade) {
    const totalRegistered = atividade.data_atividade?.reduce(
        (acc, curr) => acc + (curr._count?.data_atividade_participante || 0), 0
    ) || 0;
    const totalVagas = atividade.limite || 0;
    const isUnlimitedSpots = totalVagas === 0;
    const vagasRestantes = isUnlimitedSpots ? Infinity : Math.max(totalVagas - totalRegistered, 0);
    const alunosNaListaEspera = !isUnlimitedSpots && totalRegistered > totalVagas ? totalRegistered - totalVagas : 0;
    const limiteListaEspera = isUnlimitedSpots ? 0 : Math.ceil(totalVagas / 2);
    const listaEsperaCheia = !isUnlimitedSpots && alunosNaListaEspera >= limiteListaEspera;
    const inscricoesAbertas = isUnlimitedSpots || vagasRestantes > 0 || !listaEsperaCheia;

    return {
        totalRegistered,
        totalVagas,
        isUnlimitedSpots,
        vagasRestantes,
        alunosNaListaEspera,
        limiteListaEspera,
        listaEsperaCheia,
        inscricoesAbertas
    };
}
