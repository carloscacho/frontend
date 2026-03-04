/**
 * Adapta os dados de Evento vindos da API para o formato esperado pelo UI Frontend
 * @param {Object} rawData - Dados puros da API
 * @returns {Object} Dados formatados
 */
export const formatEventoData = (rawData) => {
    if (!rawData) return null;

    return {
        ...rawData,
        // Garante que as datas venham no formato YYYY-MM-DD para os inputs HTML
        inicio: rawData.inicio ? rawData.inicio.split('T')[0] : null,
        final: rawData.final ? rawData.final.split('T')[0] : null,
        // Fallback pra nome fantasia ou padronização de nulos
        cor_primaria: rawData.cor_primaria || '#000000',
        cor_secundaria: rawData.cor_secundaria || '#FFFFFF'
    };
};
