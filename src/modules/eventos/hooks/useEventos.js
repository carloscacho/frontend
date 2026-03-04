import { useAdminCrud } from "@/shared/hooks/useAdminCrud";
import { dateFormateBr } from "@/shared/utils/dateUtils";
import API from "@/lib/api/axios-instance";
import { useState } from "react";

// Normalizer function to transform data for display
const normalizeEventos = (lista) => {
    return lista.map(item => ({
        id: item.id_evento,
        nome: item.nome,
        description: `${item.ano} - ${dateFormateBr(item.inicio)} - ${dateFormateBr(item.final)}`,
        raw: item
    }));
};

export function useEventos() {
    const [selectedEventForImport, setSelectedEventForImport] = useState(null);

    const crudOps = useAdminCrud({
        endpoint: '/evento',
        entityName: 'Evento',
        idField: 'id_evento',
        normalizer: normalizeEventos,
        isFormData: true // Eventos usa Multipart/form-data pro upload de imagem
    });

    const importCsvAtividades = async (atividades) => {
        try {
            // Esta funcionalidade afeta ATIVIDADES dentro do modulo Eventos (A nivel de arquivo importa pra Atividades)
            const response = await API.post('/atividade/batch', { atividades });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Erro ao importar atividades');
        }
    };

    return {
        ...crudOps,
        selectedEventForImport,
        setSelectedEventForImport,
        importCsvAtividades
    };
}
