import { getAllRecords, createRecord, updateRecord, deleteRecord, getRecordBySlug } from '@/utils/crud';

export const eventoService = {
    async getAll() {
        return getAllRecords('/evento');
    },

    async getBySlug(slug) {
        return getRecordBySlug('/evento', slug);
    },

    async create(data) {
        return createRecord('/evento', data);
    },

    async update(id, data) {
        return updateRecord('/evento', id, data);
    },

    async delete(id) {
        return deleteRecord('/evento', id);
    }
};
