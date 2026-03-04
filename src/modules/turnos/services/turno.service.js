import API from "@/lib/api/axios-instance";

export const turnoService = {
    async getAll() {
        const res = await API.get('/turno');
        return res.data;
    },
    async create(data) {
        const res = await API.post('/turno', data);
        return res.data;
    },
    async update(id, data) {
        const res = await API.put(`/turno/${id}`, data);
        return res.data;
    },
    async delete(id) {
        const res = await API.delete(`/turno/${id}`);
        return res.data;
    }
};
