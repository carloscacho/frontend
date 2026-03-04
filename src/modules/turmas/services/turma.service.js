import API from "@/lib/api/axios-instance";

export const turmaService = {
    async getAll() {
        const res = await API.get('/turma');
        return res.data;
    },
    async create(data) {
        const res = await API.post('/turma', data);
        return res.data;
    },
    async update(id, data) {
        const res = await API.put(`/turma/${id}`, data);
        return res.data;
    },
    async delete(id) {
        const res = await API.delete(`/turma/${id}`);
        return res.data;
    }
};
