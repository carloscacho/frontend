import { useAdminCrud } from "@/shared/hooks/useAdminCrud";

const normalizeSalas = (lista) => {
    return lista.map(item => ({ id: item.id_sala, nome: item.nome }));
};

export function useSalas() {
    return useAdminCrud({
        endpoint: '/sala',
        entityName: 'Sala',
        idField: 'id_sala',
        normalizer: normalizeSalas
    });
}
