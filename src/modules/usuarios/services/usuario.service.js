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
    }
};
