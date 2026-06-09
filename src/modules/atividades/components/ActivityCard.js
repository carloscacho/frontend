'use client';
import { useRouter } from 'next/navigation';
import { PiUsersFourDuotone, PiWarningDuotone, PiUserPlusDuotone, PiUserMinusDuotone, PiQrCodeDuotone, PiShareNetworkDuotone } from 'react-icons/pi';
import { useAlerta } from '@/shared/contexts/AlertContext';
import { darkenColor, calculateVacancyInfo } from './activityCardUtils';
import ActivityCardHeader from './ActivityCardHeader';
import ActivityCardDetails from './ActivityCardDetails';
import SpeakersList from './SpeakersList';

export default function ActivityCard({ atividade, evento, isRegistered, onParticipar, onScan, conflictError, usuario }) {
    const router = useRouter();
    const { mostrarAlerta } = useAlerta();

    // Calculate vacancy info
    const vacancyInfo = calculateVacancyInfo(atividade);
    const { totalRegistered, isUnlimitedSpots, vagasRestantes, inscricoesAbertas } = vacancyInfo;

    const speakers = atividade.palestrante_atividade?.map(pa => pa.palestrante) || [];

    // Colors from event
    const corPrimaria = evento.cor_primaria || '#2F855A';
    const corSecundaria = evento.cor_secundaria || '#3ABFF8';
    const corPrimariaDark = darkenColor(corPrimaria, 15);
    const corSecundariaDark = darkenColor(corSecundaria, 15);

    const isAviso = atividade.limite === -1;

    const registered = isRegistered(atividade);
    const isAdminOrAux = usuario && [1, 3, 4].includes(usuario.tipo);

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

    const handleShare = async () => {
        const url = `${window.location.origin}${window.location.pathname}#atividade-${atividade.id_atividade}`;

        let dateTimeStr = 'Data a definir';
        if (atividade.data_atividade && atividade.data_atividade.length > 0) {
            const sessions = atividade.data_atividade.map(da => {
                const date = new Date(da.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
                const time = new Date(da.hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
                return `${date} às ${time}`;
            });
            dateTimeStr = sessions.join(' / ');
        }

        const shareText = `Evento: ${evento.nome}\nAtividade: ${atividade.nome}\nData e hora: ${dateTimeStr}\nLink: ${url}`;

        const shareData = {
            title: `Atividade: ${atividade.nome}`,
            text: shareText
            // Omitting 'url' property here because it's already cleanly placed inside the 'text' property. 
            // Some mobile apps duplicate the link if both are provided.
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                // Fallback to clipboard
                await navigator.clipboard.writeText(shareText);
                mostrarAlerta('success', 'Informações copiadas para a área de transferência!');
            }
        } catch (error) {
            console.error('Error sharing:', error);
            // Ignore AbortError when user dismisses the share sheet
            if (error.name !== 'AbortError') {
                mostrarAlerta('error', 'Não foi possível compartilhar a atividade.');
            }
        }
    };

    return (
        <div
            id={`atividade-${atividade.id_atividade}`}
            className={`card bg-base-100 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden ${registered ? 'ring-4' : ''
                }`}
            style={{
                '--tw-ring-color': registered ? corSecundaria : undefined,
            }}
        >
            {/* Card Header */}
            <ActivityCardHeader
                atividade={atividade}
                corPrimaria={isAviso ? corSecundaria : corPrimaria}
                corPrimariaDark={isAviso ? corSecundariaDark : corPrimariaDark}
                registered={registered}
                usuario={usuario}
                conflictError={conflictError}
            />

            {/* Card Body */}
            <div className="card-body p-6">
                {/* Action Buttons */}
                {usuario && (
                    <div className="flex justify-end -mt-11 z-10 mb-2 gap-2">
                        <button
                            className="btn btn-sm md:btn-md btn-circle bg-base-100 shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl hover:text-primary"
                            onClick={handleShare}
                            title="Compartilhar Atividade"
                        >
                            <PiShareNetworkDuotone className="w-5 h-5" />
                        </button>
                        {!isAviso && (
                            <button
                                className={`btn btn-sm md:btn-md rounded-full shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl px-3 md:px-5 gap-1 md:gap-2 ${buttonConfig.className}`}
                                style={!buttonConfig.disabled && !registered ? {
                                    backgroundColor: corSecundaria,
                                    borderColor: corSecundaria,
                                    color: '#fff',
                                    boxShadow: `0 4px 14px ${corSecundaria}40`
                                } : registered ? {
                                    boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)'
                                } : undefined}
                                onClick={() => onParticipar(atividade)}
                                disabled={buttonConfig.disabled}
                            >
                                {buttonConfig.icon}
                                <span className="hidden md:inline">{buttonConfig.text}</span>
                                <span className="md:hidden">{buttonConfig.mobileText}</span>
                            </button>
                        )}
                    </div>
                )}
                {/* Admin Buttons */}
                {isAdminOrAux && (
                    <div className="flex flex-col gap-2 mb-4">
                        {!isAviso && (
                            <button
                                className="btn btn-outline btn-sm hover:scale-102 transition-transform"
                                style={{ borderColor: corSecundaria, color: corSecundaria }}
                                onClick={() => router.push(`/${evento.slug}/programacao/${atividade.id_atividade}/participantes`)}
                            >
                                <PiUsersFourDuotone className="w-4 h-4" /> Ver Inscritos ({totalRegistered})
                            </button>
                        )}

                        <button
                            className="btn btn-primary btn-sm hover:scale-102 transition-transform"
                            onClick={() => onScan && onScan(atividade)}
                        >
                            <PiQrCodeDuotone className="w-4 h-4" /> Ler QR Code
                        </button>
                    </div>
                )}

                {/* Description Text */}
                {atividade.descricao && (
                    <div className="mb-4 text-sm md:text-base text-gray-700 whitespace-pre-wrap">
                        {atividade.descricao}
                    </div>
                )}

                {/* Observation Warning */}
                {atividade.observacao && (
                    <div className="alert alert-warning mb-4 py-2">
                        <PiWarningDuotone className="w-5 h-5" />
                        <span className="text-sm md:text-lg">{atividade.observacao}</span>
                    </div>
                )}

                {/* Info Grid */}
                <div className={`grid grid-cols-1 ${speakers.length > 0 ? 'md:grid-cols-2' : ''} gap-6`}>
                    {/* Left Column - Details */}
                    <ActivityCardDetails
                        atividade={atividade}
                        vacancyInfo={vacancyInfo}
                    />

                    {/* Right Column - Speakers */}
                    {speakers.length > 0 && (
                        <SpeakersList
                            speakers={speakers}
                            corSecundaria={corSecundaria}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
