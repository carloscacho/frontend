import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { activityService } from '../services/activityService';

export function useMinhaArea(slug) {
    const { usuario } = useAuth();
    const router = useRouter();

    const [evento, setEvento] = useState(null);
    const [loading, setLoading] = useState(true);
    const [myActivities, setMyActivities] = useState([]);
    const [loadingActivities, setLoadingActivities] = useState(true);

    const fetchData = useCallback(async () => {
        if (!slug) return;

        setLoading(true);
        let currentEvento = null;

        try {
            // 1. Fetch Event
            try {
                currentEvento = await activityService.getEventBySlug(slug);
                setEvento(currentEvento);
            } catch (error) {
                console.error('Error fetching event:', error);
            }

            // 2. Fetch and Filter Activities
            if (currentEvento && usuario?.participante?.[0]?.id_participante) {
                try {
                    const data = await activityService.getParticipantActivities(usuario.participante[0].id_participante);

                    const filteredData = data.filter(item =>
                        item.data_atividade?.atividade?.fk_evento === currentEvento.id_evento
                    );

                    const sorted = filteredData.sort((a, b) => {
                        const dateA = new Date(`${a.data_atividade.data.split('T')[0]}T${a.data_atividade.hora.split('T')[1]}`);
                        const dateB = new Date(`${b.data_atividade.data.split('T')[0]}T${b.data_atividade.hora.split('T')[1]}`);
                        return dateA - dateB;
                    });

                    setMyActivities(sorted);
                } catch (error) {
                    console.error('Error fetching activities:', error);
                }
            }
        } finally {
            setLoading(false);
            setLoadingActivities(false);
        }
    }, [slug, usuario]);

    useEffect(() => {
        if (!usuario) {
            // Assuming redirect is handled by middleware or page component, 
            // but we can imply loading state here
            return;
        }
        fetchData();
    }, [fetchData, usuario]);

    return {
        evento,
        loading,
        myActivities,
        loadingActivities,
        refresh: fetchData
    };
}
