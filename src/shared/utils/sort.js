export function sortItems(items, criteria) {
    if (!items) return [];

    const sorted = [...items];

    switch (criteria) {
        case 'name-asc':
            return sorted.sort((a, b) => a.nome.localeCompare(b.nome));
        case 'name-desc':
            return sorted.sort((a, b) => b.nome.localeCompare(a.nome));
        case 'id-asc':
            // Assuming id is the first key or we can find it. 
            // Ideally items should have a consistent ID property, but they might be id_atividade, id_evento etc.
            // We'll try to find the ID property dynamically or assume 'id' if normalized, 
            // but the raw data has specific ID names.
            // However, the pages normalize the list before passing to ListItens, but the filtering happens on the raw list usually.
            // Let's check how filterItems works. It works on raw items.
            // Raw items have different ID keys (id_atividade, id_evento).
            // We need a way to identify the ID.
            // Or we can rely on the fact that created_at usually correlates with ID.
            // Let's try to find the property starting with 'id_'.
            return sorted.sort((a, b) => {
                const idKeyA = Object.keys(a).find(k => k.startsWith('id_'));
                const idKeyB = Object.keys(b).find(k => k.startsWith('id_'));
                if (idKeyA && idKeyB) {
                    return a[idKeyA] - b[idKeyB];
                }
                return 0;
            });
        case 'id-desc':
            return sorted.sort((a, b) => {
                const idKeyA = Object.keys(a).find(k => k.startsWith('id_'));
                const idKeyB = Object.keys(b).find(k => k.startsWith('id_'));
                if (idKeyA && idKeyB) {
                    return b[idKeyB] - a[idKeyA];
                }
                return 0;
            });
        default:
            return sorted;
    }
}
