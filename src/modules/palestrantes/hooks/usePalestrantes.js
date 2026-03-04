import { useAdminCrud } from "@/shared/hooks/useAdminCrud";
import { palestranteService } from "../services/palestrante.service";
import { useEventFilter } from "@/shared/contexts/EventFilterContext";

// Normalizer function to transform data for display
const normalizePalestrantes = (lista) => {
    return lista.map(item => {
        const eventos = item.palestrante_evento?.map(pe => pe.evento.nome).join(", ") || "Nenhum evento";
        return {
            id: item.id_palestrante,
            nome: item.nome,
            description: `${item.email} - Eventos: ${eventos}`,
            raw: item // Keep raw data if needed
        };
    });
};

export function usePalestrantes() {
    const { eventoSelect } = useEventFilter();

    const crudOps = useAdminCrud({
        endpoint: '/palestrante',
        entityName: 'Palestrante',
        idField: 'id_palestrante',
        normalizer: normalizePalestrantes,
        filterEndpoint: '/palestrante/full',
        eventFilter: eventoSelect
    });

    const importCsv = async (palestrantes) => {
        if (!eventoSelect) {
            throw new Error('Selecione um evento primeiro');
        }
        const data = await palestranteService.batchImport(palestrantes, eventoSelect.id_evento);
        crudOps.refreshList?.();
        return data;
    };

    return {
        ...crudOps,
        eventoSelect,
        importCsv
    };
}
