const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4455';

export const activityService = {
    async getEventBySlug(slug) {
        const res = await fetch(`${API_URL}/evento/slug/${slug}`);
        if (!res.ok) throw new Error('Failed to fetch event');
        return res.json();
    },

    async getParticipantActivities(participantId) {
        const res = await fetch(`${API_URL}/data-atividade-participante/participante/${participantId}`);
        if (!res.ok) throw new Error('Failed to fetch participant activities');
        return res.json();
    }
};
