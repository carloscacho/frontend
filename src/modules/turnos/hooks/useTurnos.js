import { useAdminCrud } from "@/shared/hooks/useAdminCrud";

const normalizeTurnos = (lista) => {
    return lista.map(item => ({ id: item.id_turno, nome: item.nome }));
};

export function useTurnos() {
    return useAdminCrud({
        endpoint: '/turno',
        entityName: 'Turno',
        idField: 'id_turno',
        normalizer: normalizeTurnos
    });
}
