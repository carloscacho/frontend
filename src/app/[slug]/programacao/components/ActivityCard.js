'use client';
import { useRouter } from 'next/navigation';
import { PiUsersFourDuotone, PiWarningDuotone, PiUserPlusDuotone, PiUserMinusDuotone } from 'react-icons/pi';
import { darkenColor, calculateVacancyInfo } from './activityCardUtils';
import ActivityCardHeader from './ActivityCardHeader';
import ActivityCardDetails from './ActivityCardDetails';
import SpeakersList from './SpeakersList';

export default function ActivityCard({ atividade, evento, isRegistered, onParticipar, conflictError, usuario }) {
    const router = useRouter();

    // Calculate vacancy info
    const vacancyInfo = calculateVacancyInfo(atividade);
    const { totalRegistered, isUnlimitedSpots, vagasRestantes, inscricoesAbertas } = vacancyInfo;

    const speakers = atividade.palestrante_atividade?.map(pa => pa.palestrante) || [];

    // Colors from event
    const corPrimaria = evento.cor_primaria || '#2F855A';
    const corSecundaria = evento.cor_secundaria || '#3ABFF8';
    const corPrimariaDark = darkenColor(corPrimaria, 15);

    const registered = isRegistered(atividade);
    const isAdminOrAux = usuario && (usuario.tipo === 1 || usuario.tipo === 3);

    // Determine button state
    const getButtonConfig = () => {
        if (registered) {
            return {
                text: 'Cancelar Inscrição',
                mobileText: 'Cancelar',
                className: 'btn-error',
                disabled: false,
                icon: <PiUserMinusDuotone className="w-4 h-4 md:w-5 md:h-5" />
            };
        }
        if (!inscricoesAbertas) {
            return {
                text: 'Inscrições Encerradas',
                mobileText: 'Encerrado',
                className: 'btn-info',
                disabled: true,
                icon: null
            };
        }
        if (vagasRestantes === 0 && !isUnlimitedSpots) {
            return {
                text: 'Entrar na Lista de Espera',
                mobileText: 'Lista de Espera',
                className: '',
                disabled: false,
                icon: <PiUserPlusDuotone className="w-4 h-4 md:w-5 md:h-5" />
            };
        }
        return {
            text: 'Inscrever-se',
            mobileText: 'Inscrever',
            className: '',
            disabled: false,
            icon: <PiUserPlusDuotone className="w-4 h-4 md:w-5 md:h-5" />
        };
    };

    const buttonConfig = getButtonConfig();

    return (
        <div
            className={`card bg-base-100 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden ${registered ? 'ring-4' : ''
                }`}
            style={{
                '--tw-ring-color': registered ? corSecundaria : undefined,
            }}
        >
            {/* Card Header */}
            <ActivityCardHeader
                atividade={atividade}
                corPrimaria={corPrimaria}
                corPrimariaDark={corPrimariaDark}
                corSecundaria={corSecundaria}
                registered={registered}
                usuario={usuario}
                conflictError={conflictError}
                buttonConfig={buttonConfig}
                onParticipar={onParticipar}
            />

            {/* Card Body */}
            <div className={`card-body p-6 ${usuario ? 'pt-10' : ''}`}>
                {/* Admin Button */}
                {isAdminOrAux && (
                    <button
                        className="btn btn-outline btn-sm mb-4 hover:scale-102 transition-transform"
                        style={{ borderColor: corSecundaria, color: corSecundaria }}
                        onClick={() => router.push(`/${evento.slug}/programacao/${atividade.id_atividade}/participantes`)}
                    >
                        <PiUsersFourDuotone className="w-4 h-4" /> Ver Inscritos ({totalRegistered})
                    </button>
                )}

                {/* Observation Warning */}
                {atividade.observacao && (
                    <div className="alert alert-warning mb-4 py-2">
                        <PiWarningDuotone className="w-5 h-5" />
                        <span className="text-sm">{atividade.observacao}</span>
                    </div>
                )}

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column - Details */}
                    <ActivityCardDetails
                        atividade={atividade}
                        vacancyInfo={vacancyInfo}
                    />

                    {/* Right Column - Speakers */}
                    <SpeakersList
                        speakers={speakers}
                        corSecundaria={corSecundaria}
                    />
                </div>
            </div>
        </div>
    );
}
