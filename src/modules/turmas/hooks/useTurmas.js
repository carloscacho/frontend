import { useAdminCrud } from "@/shared/hooks/useAdminCrud";

const normalizeTurmas = (lista) => {
    return lista.map(item => ({ id: item.id_turma, nome: item.nome }));
};

export function useTurmas() {
    return useAdminCrud({
        endpoint: '/turma',
        entityName: 'Turma',
        idField: 'id_turma',
        normalizer: normalizeTurmas
    });
}
