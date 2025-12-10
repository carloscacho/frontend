const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4455';

/**
 * Service for palestrante (speaker) CRUD operations
 */
export const palestranteService = {
    async getAll() {
        const res = await fetch(`${API_URL}/palestrante`);
        if (!res.ok) throw new Error('Failed to fetch palestrantes');
        return res.json();
    },

    async getByEvento(eventoId) {
        const res = await fetch(`${API_URL}/palestrante/full/${eventoId}`);
        if (!res.ok) throw new Error('Failed to fetch palestrantes for event');
        return res.json();
    },

    async getById(id) {
        const res = await fetch(`${API_URL}/palestrante/${id}`);
        if (!res.ok) throw new Error('Failed to fetch palestrante');
        return res.json();
    },

    async create(data, token) {
        const res = await fetch(`${API_URL}/palestrante`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to create palestrante');
        }
        return res.json();
    },

    async update(id, data, token) {
        const res = await fetch(`${API_URL}/palestrante/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to update palestrante');
        }
        return res.json();
    },

    async delete(id, token) {
        const res = await fetch(`${API_URL}/palestrante/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to delete palestrante');
        }
        return res.json();
    }
};
