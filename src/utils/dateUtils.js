
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

export { formatDateToISO, dateFormateBr }