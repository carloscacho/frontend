import API from "@/lib/api/axios-instance";
import { formatEventoData } from "../domain/evento.mapper";

export const eventoService = {
    async getAll() {
        const response = await API.get('/evento');
        return response.data;
    },

    async getBySlug(slug) {
        const response = await API.get(`/evento/slug/${slug}`);
        return formatEventoData(response.data);
    },

    async getById(id) {
        const response = await API.get(`/evento/${id}`);
        return formatEventoData(response.data);
    },

    async create(data) {
        const response = await API.post('/evento', data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    async update(id, data) {
        const response = await API.put(`/evento/${id}`, data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    async delete(id) {
        const response = await API.delete(`/evento/${id}`);
        return response.data;
    },
 
    async getReport(id) {
        const response = await API.get(`/evento/${id}/relatorio`);
        return response.data;
    }
};
