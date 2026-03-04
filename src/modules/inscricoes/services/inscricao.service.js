import API from "@/lib/api/axios-instance";
import Cookies from 'js-cookie';

export const inscricaoService = {
    async fetchParticipantActivities(participantId) {
        // The API instance already adds the Authorization header if logged in
        // but we keep a check to avoid errors for non-logged in users.
        const userCookies = Cookies.get('usuarioData');
        if (!userCookies) return [];

        const res = await API.get(`/data-atividade-participante/participante/${participantId}`);
        return res.data;
    },

    async ensureParticipant(usuario) {
        const resPart = await API.post(`/participante`, { fk_usuario: usuario.id_usuario });
        return resPart.data;
    },

    async linkParticipantToEvent(eventId, participantId) {
        await API.post(`/evento-participante`, {
            fk_evento: eventId,
            fk_participante: participantId
        });
    },

    async manageActivityRegistration(action, session, participantId) {
        let url = `/data-atividade-participante`;

        if (action === 'POST') {
            const res = await API.post(url, {
                fk_data_atividade: session.id_data_atividade,
                fk_participante: participantId,
                presenca: 0
            });
            return { ok: true, status: 200, data: res.data };
        } else {
            url += `/${session.id_data_atividade}/${participantId}`;
            const res = await API.delete(url);
            return { ok: true, status: 200, data: res.data };
        }
    },

    async batchEnrollParticipants(activityId, emails) {
        const res = await API.post(`/atividade/${activityId}/inscrever-participantes`, { emails });
        return res.data;
    }
};
