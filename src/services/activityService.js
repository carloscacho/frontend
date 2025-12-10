const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4455';

/**
 * Service for activity-related operations
 */
export const activityService = {
    // --- Event fetching ---
    async getEventBySlug(slug) {
        const res = await fetch(`${API_URL}/evento/slug/${slug}`);
        if (!res.ok) throw new Error('Failed to fetch event');
        return res.json();
    },

    // --- Participant activities ---
    async getParticipantActivities(participantId) {
        const res = await fetch(`${API_URL}/data-atividade-participante/participante/${participantId}`);
        if (!res.ok) throw new Error('Failed to fetch participant activities');
        return res.json();
    },

    // --- Activity CRUD ---
    async getAll() {
        const res = await fetch(`${API_URL}/atividade`);
        if (!res.ok) throw new Error('Failed to fetch activities');
        return res.json();
    },

    async getAllFull() {
        const res = await fetch(`${API_URL}/atividade/full`);
        if (!res.ok) throw new Error('Failed to fetch activities');
        return res.json();
    },

    async getAllByEvento(eventoId) {
        const res = await fetch(`${API_URL}/atividade/full/${eventoId}`);
        if (!res.ok) throw new Error('Failed to fetch activities for event');
        return res.json();
    },

    async getById(id) {
        const res = await fetch(`${API_URL}/atividade/${id}`);
        if (!res.ok) throw new Error('Failed to fetch activity');
        return res.json();
    },

    async getWithParticipants(id) {
        const res = await fetch(`${API_URL}/atividade/${id}/participantes`);
        if (!res.ok) throw new Error('Failed to fetch activity with participants');
        return res.json();
    },

    async create(data, token) {
        const res = await fetch(`${API_URL}/atividade`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to create activity');
        }
        return res.json();
    },

    async update(id, data, token) {
        const res = await fetch(`${API_URL}/atividade/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to update activity');
        }
        return res.json();
    },

    async delete(id, token) {
        const res = await fetch(`${API_URL}/atividade/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to delete activity');
        }
        return res.json();
    }
};
