'use client'
import { useParams, useRouter } from 'next/navigation';
import { PiPrinter, PiFileText, PiUserPlus } from 'react-icons/pi';
import InscricaoParticipanteModal from '@/modules/inscricoes/components/InscricaoParticipanteModal';
import LoadingSpinner from '@/shared/components/displays/LoadingSpinner';
import Button from '@/shared/components/utils/Button';
import { useParticipantesAtividade } from '@/modules/programacao/hooks/useParticipantesAtividade';
import TabelaParticipantes from '@/modules/programacao/components/TabelaParticipantes';

export default function ParticipantsPage() {
    const params = useParams();
    const router = useRouter();
    const { activityId, slug } = params;

    const {
        atividade,
        loading,
        inscricaoModalRef,
        handlePresence,
        handlePrintAttendanceList,
        handlePrintReport,
        fetchAtividade
    } = useParticipantesAtividade(activityId, slug);

    if (loading) {
        return <LoadingSpinner fullScreen={true} />;
    }

    if (!atividade) {
        return <div className="text-center p-8">Atividade não encontrada</div>;
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex flex-wrap items-center gap-3 mb-6">
                <Button
                    onClick={() => router.back()}
                    mode="outline"
                    color="neutral"
                    className="m-0"
                >
                    ← Voltar
                </Button>

                <div className="flex-1"></div>

                <Button
                    onClick={handlePrintAttendanceList}
                    color="secondary"
                    mode=""
                    className="btn-sm gap-2 print:hidden m-0"
                    title="Imprimir Lista de Presença (PDF)"
                >
                    <PiPrinter size={18} />
                    Lista de Presença
                </Button>
                <Button
                    onClick={handlePrintReport}
                    color="info"
                    mode=""
                    className="btn-sm gap-2 print:hidden m-0"
                    title="Imprimir Relatório"
                >
                    <PiFileText size={18} />
                    Relatório
                </Button>
                <Button
                    onClick={() => inscricaoModalRef.current?.showModal()}
                    color="primary"
                    mode=""
                    className="btn-sm gap-2 print:hidden m-0"
                    title="Inscrever Participante"
                >
                    <PiUserPlus size={18} />
                    Inscrever
                </Button>
            </div>

            <div className="card bg-base-100 shadow-xl border border-base-200 mb-8">
                <div className="card-body">
                    <h1 className="card-title text-3xl mb-2">{atividade.nome}</h1>
                    <p className="text-gray-600 mb-4">{atividade.descricao}</p>
                    <div className="flex gap-4 text-sm font-bold">
                        <span>Local: {atividade.sala?.nome || 'A definir'}</span>
                    </div>
                </div>
            </div>

            <h2 className="text-2xl font-bold mb-6">Lista de Presença</h2>

            <TabelaParticipantes 
                atividade={atividade} 
                handlePresence={handlePresence} 
            />

            {/* Enrollment Modal */}
            <InscricaoParticipanteModal
                refModal={inscricaoModalRef}
                activityId={activityId}
                onSuccess={() => {
                    fetchAtividade();
                }}
            />
        </div>
    );
}
