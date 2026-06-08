import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useAlerta } from '@/shared/contexts/AlertContext';
import { atividadeService } from '@/modules/atividades/services/atividade.service';
import { inscricaoService } from '@/modules/inscricoes/services/inscricao.service';
import { printAttendanceList, printActivityReport } from '@/shared/utils/printUtils';
import { calculateEndTime } from '@/shared/utils/dateUtils';

export const useParticipantesAtividade = (activityId, slug) => {
    const router = useRouter();
    const { usuario } = useAuth();
    const { mostrarAlerta } = useAlerta();

    const [atividade, setAtividade] = useState(null);
    const [loading, setLoading] = useState(true);
    const inscricaoModalRef = useRef(null);

    useEffect(() => {
        // Simple role check redirect
        if (usuario && ![1, 3, 4].includes(usuario.tipo)) {
            router.push(`/${slug}/programacao`);
        }
    }, [usuario, slug, router]);

    const fetchAtividade = async () => {
        try {
            const data = await atividadeService.getWithParticipants(activityId);
            setAtividade(data);
        } catch (error) {
            console.error('Error fetching activity:', error);
            mostrarAlerta('error', 'Erro ao carregar atividade');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activityId) {
            fetchAtividade();
        }
    }, [activityId]);

    const handlePresence = async (dataAtividadeId, participanteId, status) => {
        try {
            await inscricaoService.updatePresence(dataAtividadeId, participanteId, status);
            mostrarAlerta('success', 'Presença atualizada com sucesso');
            fetchAtividade();
        } catch (error) {
            console.error('Error updating presence:', error);
            mostrarAlerta('error', 'Erro ao atualizar presença');
        }
    };

    // Collect all unique participants across all sessions
    const getAllParticipants = () => {
        if (!atividade?.data_atividade) return [];
        const map = new Map();
        atividade.data_atividade.forEach(session => {
            session.data_atividade_participante?.forEach(inscricao => {
                const p = inscricao.participante;
                if (!map.has(p.id_participante)) {
                    map.set(p.id_participante, {
                        nome: p.usuario.nome,
                        email: p.usuario.email,
                        instituicao: p.usuario.instituicao || '',
                    });
                }
            });
        });
        return Array.from(map.values()).sort((a, b) => a.nome.localeCompare(b.nome));
    };

    const handlePrintAttendanceList = () => {
        printAttendanceList({
            title: atividade?.nome || 'Atividade',
            subtitle: atividade?.sala?.nome,
            participants: getAllParticipants(),
        });
    };

    const handlePrintReport = () => {
        printActivityReport({ atividade, calculateEndTime });
    };

    return {
        atividade,
        loading,
        inscricaoModalRef,
        handlePresence,
        handlePrintAttendanceList,
        handlePrintReport,
        fetchAtividade
    };
};
