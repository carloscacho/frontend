import API from "@/lib/api/axios-instance";

export const palestranteService = {
    async getAll() {
        const response = await API.get('/palestrante');
        return response.data;
    },

    async getByEvento(eventoId) {
        const response = await API.get(`/palestrante/full/${eventoId}`);
        return response.data;
    },

    async getById(id) {
        const response = await API.get(`/palestrante/${id}`);
        return response.data;
    },

    async create(data) {
        const response = await API.post('/palestrante', data);
        return response.data;
    },

    async update(id, data) {
        const response = await API.put(`/palestrante/${id}`, data);
        return response.data;
    },

    async delete(id) {
        const response = await API.delete(`/palestrante/${id}`);
        return response.data;
    },

    async batchImport(palestrantes, fk_evento) {
        const response = await API.post('/palestrante/batch', {
            palestrantes,
            fk_evento
        });
        return response.data;
    }
};
