
const formatDateToISO = (date) => {
    if (!date) return null;
    if (typeof date === 'string') {
        return new Date(date + 'T00:00:00').toISOString();
    }
    if (date instanceof Date) {
        return date.toISOString();
    }
    return date;
};

const dateFormateBr = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

const calculateEndTime = (dateStr, timeStr, durationStr) => {
    if (!timeStr || !durationStr) return '';

    // Extract date part (YYYY-MM-DD), defaulting to epoch if not provided
    const datePart = dateStr ? dateStr.split('T')[0] : '1970-01-01';

    // Parse start time (handling ISO string or HH:mm)
    const timeDate = new Date(timeStr); // UTC assumption from previous steps
    const startHours = timeDate.getUTCHours();
    const startMinutes = timeDate.getUTCMinutes();

    // Parse duration
    const durationDate = new Date(durationStr);
    const durationHours = durationDate.getUTCHours();
    const durationMinutes = durationDate.getUTCMinutes();

    // Calculate total minutes
    let totalMinutes = (startHours * 60 + startMinutes) + (durationHours * 60 + durationMinutes);

    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;

    // Format to HH:mm
    const pad = (n) => n.toString().padStart(2, '0');
    return `${pad(endHours)}:${pad(endMinutes)}`;
}

const getSemestersOptions = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // 1-12
    const isFirstHalf = currentMonth <= 6;
    
    if (isFirstHalf) {
        return [
            { value: 1, label: getSemesterLabel(1, currentYear) },
            { value: 3, label: getSemesterLabel(3, currentYear) },
            { value: 5, label: getSemesterLabel(5, currentYear) },
            { value: 7, label: 'Turmas anteriores' }
        ];
    } else {
        return [
            { value: 2, label: getSemesterLabel(2, currentYear) },
            { value: 4, label: getSemesterLabel(4, currentYear) },
            { value: 6, label: getSemesterLabel(6, currentYear) },
            { value: 8, label: 'Turmas anteriores' }
        ];
    }
};

const getSemesterLabel = (sem, currentYear = new Date().getFullYear()) => {
    if (!sem) return '';
    if (sem === 1) return `${currentYear}-1 (1º Semestre)`;
    if (sem === 2) return `${currentYear}-1 (2º Semestre)`;
    if (sem === 3) return `${currentYear - 1}-1 (3º Semestre)`;
    if (sem === 4) return `${currentYear - 1}-1 (4º Semestre)`;
    if (sem === 5) return `${currentYear - 2}-1 (5º Semestre)`;
    if (sem === 6) return `${currentYear - 2}-1 (6º Semestre)`;
    return 'Turmas anteriores';
};

const formatDateRange = (start, end) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const startDay = startDate.getDate() + 1
    const endDay = endDate.getDate() + 1
    const month = startDate.toLocaleString('pt-BR', { month: 'long' })

    if (startDate.getMonth() === endDate.getMonth()) {
        return { days: `${startDay} a ${endDay}`, month }
    } else {
        const endMonth = endDate.toLocaleString('pt-BR', { month: 'long' })
        return { days: `${startDay}`, month: `${month} a ${endDay} de ${endMonth}` }
    }
}

export { formatDateToISO, dateFormateBr, calculateEndTime, getSemestersOptions, getSemesterLabel, formatDateRange }