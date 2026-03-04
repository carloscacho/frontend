import API from "@/lib/api/axios-instance";

export const salaService = {
    async getAll() {
        const res = await API.get('/sala');
        return res.data;
    },
    async create(data) {
        const res = await API.post('/sala', data);
        return res.data;
    },
    async update(id, data) {
        const res = await API.put(`/sala/${id}`, data);
        return res.data;
    },
    async delete(id) {
        const res = await API.delete(`/sala/${id}`);
        return res.data;
    }
};
