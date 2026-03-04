import API from "@/lib/api/axios-instance";

export const atividadeService = {
    // --- Activity CRUD ---
    async getAll() {
        const res = await API.get('/atividade');
        return res.data;
    },

    async getAllFull() {
        const res = await API.get('/atividade/full');
        return res.data;
    },

    async getAllByEvento(eventoId) {
        const res = await API.get(`/atividade/full/${eventoId}`);
        return res.data;
    },

    async getById(id) {
        const res = await API.get(`/atividade/${id}`);
        return res.data;
    },

    async getWithParticipants(id) {
        const res = await API.get(`/atividade/${id}/participantes`);
        return res.data;
    },

    async create(data) {
        const res = await API.post('/atividade', data);
        return res.data;
    },

    async update(id, data) {
        const res = await API.put(`/atividade/${id}`, data);
        return res.data;
    },

    async delete(id) {
        const res = await API.delete(`/atividade/${id}`);
        return res.data;
    },

    // --- Participant activities ---
    async getParticipantActivities(participantId) {
        const res = await API.get(`/data-atividade-participante/participante/${participantId}`);
        return res.data;
    }
};
