'use client';

export default function ActivityCardHeader({
    atividade,
    corPrimaria,
    corPrimariaDark,
    registered,
    usuario,
    conflictError,
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

            <div className="mt-6">
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
        </div>
    );
}
