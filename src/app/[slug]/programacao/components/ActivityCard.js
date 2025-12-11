'use client';
import { useRouter } from 'next/navigation';
import { calculateEndTime } from '@/utils/dateUtils';
import {
    PiCalendarBlankDuotone,
    PiMapPinDuotone,
    PiUsersDuotone,
    PiUsersFourDuotone,
    PiMicrophoneDuotone,
    PiWarningDuotone
} from 'react-icons/pi';

// Helper to darken a color for gradient
function darkenColor(hex, percent = 20) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max((num >> 16) - amt, 0);
    const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
    const B = Math.max((num & 0x0000FF) - amt, 0);
    return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
}

// Get initials from name
function getInitials(name) {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

export default function ActivityCard({ atividade, evento, isRegistered, onParticipar, conflictError, usuario }) {
    const router = useRouter();

    // Calculate vacancies and waiting list
    const totalRegistered = atividade.data_atividade?.reduce((acc, curr) => acc + (curr._count?.data_atividade_participante || 0), 0) || 0;
    const totalVagas = atividade.limite || 0;
    const vagasRestantes = Math.max(totalVagas - totalRegistered, 0);
    const alunosNaListaEspera = totalRegistered > totalVagas ? totalRegistered - totalVagas : 0;
    const limiteListaEspera = Math.ceil(totalVagas / 2);
    const listaEsperaCheia = alunosNaListaEspera >= limiteListaEspera;
    const inscricoesAbertas = vagasRestantes > 0 || !listaEsperaCheia;

    const speakers = atividade.palestrante_atividade?.map(pa => pa.palestrante) || [];
    const hasManySpeakers = speakers.length > 4;

    // Colors from event
    const corPrimaria = evento.cor_primaria || '#2F855A';
    const corSecundaria = evento.cor_secundaria || '#3ABFF8';
    const corPrimariaDark = darkenColor(corPrimaria, 15);

    function formatTime(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
    }

    function formatDateFull(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });
    }

    const registered = isRegistered(atividade);
    const isAdminOrAux = usuario && (usuario.tipo === 1 || usuario.tipo === 3);

    // Determine button state
    const getButtonConfig = () => {
        if (registered) {
            return { text: 'Cancelar Inscrição', className: 'btn-error', disabled: false };
        }
        if (!inscricoesAbertas) {
            return { text: 'Inscrições Encerradas', className: 'btn-disabled', disabled: true };
        }
        if (vagasRestantes === 0) {
            return { text: 'Entrar na Lista de Espera', className: '', disabled: false };
        }
        return { text: 'Inscrever-se', className: '', disabled: false };
    };

    const buttonConfig = getButtonConfig();

    return (
        <div
            className="card bg-base-100 shadow-lg hover:shadow-2xl transition-all duration-300 border border-base-200 overflow-hidden"
            style={{
                borderColor: registered ? corSecundaria : undefined,
                borderWidth: registered ? '3px' : undefined,
            }}
        >
            {/* Card Header with Gradient */}
            <div
                className="text-white p-5 relative"
                style={{
                    background: `linear-gradient(135deg, ${corPrimaria} 0%, ${corPrimariaDark} 100%)`,
                }}
            >
                {/* Activity Type Badge */}
                {atividade.descricao && (
                    <span className="absolute top-3 left-3 bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full">
                        {atividade.descricao}
                    </span>
                )}

                <div className="flex justify-between items-center mt-6">
                    <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                        {atividade.nome}
                    </h2>

                    {usuario && (
                        <div className="flex flex-col items-end gap-2 ml-4">
                            {conflictError && (
                                <span className="text-xs font-bold bg-red-100 text-red-700 px-3 py-1 rounded-lg">
                                    {conflictError}
                                </span>
                            )}
                            <button
                                className={`btn btn-lg transition-all duration-200 hover:scale-105 ${buttonConfig.className}`}
                                style={!buttonConfig.disabled && !registered ? { backgroundColor: corSecundaria, borderColor: corSecundaria, color: '#fff' } : undefined}
                                onClick={() => onParticipar(atividade)}
                                disabled={buttonConfig.disabled}
                            >
                                {buttonConfig.text}
                            </button>
                        </div>
                    )}
                </div>

                {/* Registered Badge */}
                {registered && (
                    <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        ✓ Inscrito
                    </span>
                )}
            </div>

            {/* Card Body */}
            <div className="card-body p-6">
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
                    <div className="space-y-3">
                        {/* Date & Time */}
                        {atividade.data_atividade?.map((da, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                                <span className="text-gray-500"><PiCalendarBlankDuotone className="w-5 h-5" /></span>
                                <span>
                                    <strong>{formatDateFull(da.data)}</strong> • {formatTime(da.hora)} às {calculateEndTime(da.data, da.hora, da.duracao)}
                                </span>
                            </div>
                        ))}

                        {/* Location */}
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500"><PiMapPinDuotone className="w-5 h-5" /></span>
                            <span>{atividade.sala?.nome || 'Local a definir'}</span>
                        </div>

                        {/* Vacancies Counter */}
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500"><PiUsersDuotone className="w-5 h-5" /></span>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="badge badge-outline">{totalRegistered} inscritos</span>
                                {vagasRestantes > 0 ? (
                                    <span className="badge badge-success badge-outline">{vagasRestantes} vagas restantes</span>
                                ) : (
                                    <span className="badge badge-error badge-outline">Vagas esgotadas</span>
                                )}
                            </div>
                        </div>

                        {/* Waiting List Counter */}
                        {vagasRestantes === 0 && (
                            <div className="flex items-center gap-2 text-sm ml-6">
                                <span className="badge badge-warning">{alunosNaListaEspera}/{limiteListaEspera} na lista de espera</span>
                                {listaEsperaCheia && (
                                    <span className="text-error text-xs font-semibold">(cheia)</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Column - Speakers */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-gray-500"><PiMicrophoneDuotone className="w-5 h-5" /></span>
                            <span className="font-semibold text-sm">Ministrado por:</span>
                        </div>
                        <div className={`flex flex-wrap gap-2 ${hasManySpeakers ? '' : 'flex-col'}`}>
                            {speakers.map(palestrante => (
                                <div
                                    key={palestrante.id_palestrante}
                                    className="flex items-center gap-2 bg-base-200 rounded-full px-1 py-1 text-sm hover:bg-base-300 transition-colors"
                                    title={palestrante.nome}
                                >
                                    <div
                                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                        style={{ backgroundColor: corSecundaria }}
                                    >
                                        {getInitials(palestrante.nome)}
                                    </div>
                                    <span className="truncate max-w-[150px]">{palestrante.nome}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
