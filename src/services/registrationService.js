import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4455';

export const registrationService = {
    async fetchParticipantActivities(participantId) {
        const userCookies = Cookies.get('usuarioData');
        const { token } = JSON.parse(userCookies);
        // Return empty array for non-authenticated users instead of throwing
        if (!token) return [];

        const res = await fetch(`${API_URL}/data-atividade-participante/participante/${participantId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error('Failed to fetch registrations');
        return res.json();
    },

    async ensureParticipant(usuario) {
        const userCookies = Cookies.get('usuarioData');
        const { token } = JSON.parse(userCookies);
        if (!token) throw new Error('Not authenticated');

        const resPart = await fetch(`${API_URL}/participante`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ fk_usuario: usuario.id_usuario })
        });

        if (!resPart.ok) {
            const errData = await resPart.json();
            throw new Error(errData.message || 'Falha ao criar registro de participante');
        }

        return resPart.json();
    },

    async linkParticipantToEvent(eventId, participantId) {
        const userCookies = Cookies.get('usuarioData');
        const { token } = JSON.parse(userCookies);
        if (!token) throw new Error('Not authenticated');

        await fetch(`${API_URL}/evento-participante`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                fk_evento: eventId,
                fk_participante: participantId
            })
        });
    },

    async manageActivityRegistration(action, session, participantId) {
        const userCookies = Cookies.get('usuarioData');
        const { token } = JSON.parse(userCookies);

        let url = `${API_URL}/data-atividade-participante`;
        let options = {
            method: action,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

        if (action === 'POST') {
            options.body = JSON.stringify({
                fk_data_atividade: session.id_data_atividade,
                fk_participante: participantId,
                presenca: 0
            });
        } else {
            url += `/${session.id_data_atividade}/${participantId}`;
        }

        const res = await fetch(url, options);
        return { ok: res.ok, status: res.status };
    }
};
