import API from "@/lib/api/axios-instance";

export const usuarioService = {
    async getAll() {
        const res = await API.get('/usuario');
        return res.data;
    },

    async updateRole(id, roleId) {
        const res = await API.put(`/usuario/${id}`, { tipo: roleId });
        return res.data;
    },

    async delete(id) {
        const res = await API.delete(`/usuario/${id}`);
        return res.data;
    },

    async checkCpf(cpf) {
        const res = await API.post(`/usuario/teste-cpf`, { cpf });
        return res.data;
    },

    async checkRegistration(cpf, eventId) {
        const res = await API.get(`/usuario/check-registration/${cpf}/evento/${eventId}`);
        return res.data;
    },

    async registerAndSubscribe(data) {
        const res = await API.post(`/usuario/register-and-subscribe`, data);
        return res.data;
    },

    async requestPasswordReset(data) {
        const res = await API.post(`/usuario/request-password-reset`, data);
        return res.data;
    },

    async resetPassword(data) {
        const res = await API.post(`/usuario/reset-password`, data);
        return res.data;
    }
};
