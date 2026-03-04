import { useAdminCrud } from "@/shared/hooks/useAdminCrud";
import { useEventFilter } from "@/shared/contexts/EventFilterContext";

// Normalizer function to transform data for display
const normalizeAtividades = (lista) => {
    const mapped = lista.map(item => {
        // Check if activity is incomplete (missing speakers or location)
        const hasPalestrantes = item.palestrante_atividade && item.palestrante_atividade.length > 0;
        const hasSala = item.sala && item.sala.nome;
        const isIncomplete = !hasPalestrantes || !hasSala;

        // Build missing items list
        const missingItems = [];
        if (!hasPalestrantes) missingItems.push('palestrantes');
        if (!hasSala) missingItems.push('local');

        return {
            id: item.id_atividade,
            nome: item.nome,
            description: `${item.descricao || ''} - Local: ${item.sala?.nome || 'N/A'}`,
            isIncomplete,
            missingItems: missingItems.join(', '),
            raw: item
        };
    });

    // Sort: incomplete activities first, then by ID ascending
    return mapped.sort((a, b) => {
        // First, sort by incomplete status (incomplete first)
        if (a.isIncomplete && !b.isIncomplete) return -1;
        if (!a.isIncomplete && b.isIncomplete) return 1;
        // Then by ID ascending
        return a.id - b.id;
    });
};

export function useAtividades() {
    const { eventoSelect } = useEventFilter();

    const crudOps = useAdminCrud({
        endpoint: '/atividade',
        entityName: 'Atividade',
        idField: 'id_atividade',
        normalizer: normalizeAtividades,
        filterEndpoint: '/atividade/full',
        eventFilter: eventoSelect
    });

    return {
        ...crudOps,
        eventoSelect
    };
}
