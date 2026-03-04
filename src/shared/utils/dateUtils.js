
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

export { formatDateToISO, dateFormateBr, calculateEndTime }