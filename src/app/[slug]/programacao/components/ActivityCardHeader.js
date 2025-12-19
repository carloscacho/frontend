'use client';
import { PiUserPlusDuotone, PiUserMinusDuotone } from 'react-icons/pi';

export default function ActivityCardHeader({
    atividade,
    corPrimaria,
    corPrimariaDark,
    corSecundaria,
    registered,
    usuario,
    conflictError,
    buttonConfig,
    onParticipar
}) {
    return (
        <div
            className="text-white p-5 relative rounded-t-2xl"
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

            {/* Registered Badge */}
            {registered && (
                <span className="absolute top-3 right-6 bg-green-500 text-white text-xs md:text-sm font-bold px-2 md:px-3 py-1 rounded-full flex items-center gap-1">
                    ✓ Inscrito
                </span>
            )}

            <div className="flex justify-between items-end mt-6 gap-4">
                {/* Title and conflict error */}
                <div className="flex-1 min-w-0">
                    <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                        {atividade.nome}
                    </h2>
                    {/* Conflict Error below title */}
                    {usuario && conflictError && (
                        <span className="inline-block mt-2 text-xs font-bold bg-red-100 text-red-700 px-2 py-1 rounded-lg">
                            {conflictError}
                        </span>
                    )}
                </div>

                {/* Action Button - positioned to the right */}
                {usuario && (
                    <div className="flex-shrink-0 absolute top-18 right-6">
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
                    </div>
                )}
            </div>
        </div>
    );
}
