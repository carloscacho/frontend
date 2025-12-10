import { formatDateToISO, calculateEndTime } from '@/utils/dateUtils';

export default function ActivityCard({ atividade, evento, isRegistered, onParticipar, conflictError, usuario }) {
    // Calculate total registered participants across all sessions
    const totalRegistered = atividade.data_atividade?.reduce((acc, curr) => acc + (curr._count?.data_atividade_participante || 0), 0) || 0;
    const vacancies = (atividade.limite || 0) - totalRegistered;
    const speakers = atividade.palestrante_atividade?.map(pa => pa.palestrante) || [];
    const hasManySpeakers = speakers.length > 5;

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

    return (
        <div
            className="card bg-base-100 shadow-xl border border-base-200"
            style={{
                borderColor: registered ? (evento.cor_secundaria || '#3ABFF8') : undefined,
                borderWidth: registered ? '2px' : undefined
            }}
        >
            {/* Card Header */}
            <div
                className="text-white p-4 rounded-xl"
                style={{ backgroundColor: evento.cor_secundaria || '#3ABFF8' }} // Fallback to info color if not set
            >
                <div className="flex justify-between items-center">
                    <h2 className="card-title col-span-10 text-xl font-bold uppercase justify-center text-center">
                        {atividade.nome}
                    </h2>
                    {usuario && (
                        <div className="card-actions col-span-2 justify-end flex flex-col items-end">
                            {conflictError && (
                                <span className="text-error text-xs font-bold mb-1 text-right bg-white px-2 py-1 rounded">
                                    {conflictError}
                                </span>
                            )}
                            <button
                                className={`btn ${registered ? 'btn-error' : 'btn-primary'} btn-lg`}
                                onClick={() => onParticipar(atividade)}
                            >
                                {registered ? 'Cancelar Inscrição' : 'Inscrever-se'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Card Body */}
            <div className="card-body p-6">
                <p className="mb-4 text-justify">{atividade.descricao}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        {atividade.data_atividade?.map((da, index) => (
                            <div key={index} className="mb-2">
                                <p><strong>Data:</strong> {formatDateFull(da.data)} - {formatTime(da.hora)} às {calculateEndTime(da.data, da.hora, da.duracao)}</p>
                            </div>
                        ))}
                        <p><strong>Local:</strong> {atividade.sala?.nome || 'A definir'}</p>
                        <p><strong>Vagas:</strong> {vacancies > 0 ? vacancies : 0}</p>
                        <p><strong>Alunos em lista de Espera:</strong> {vacancies < 0 ? Math.abs(vacancies) : 0}</p>
                    </div>

                    <div>
                        <p className="font-bold mb-1">Ministrado por:</p>
                        <ul className={`list-none ${hasManySpeakers ? 'grid grid-cols-2 gap-x-4' : ''}`}>
                            {speakers.map(palestrante => (
                                <li key={palestrante.id_palestrante} className="mb-1">
                                    {palestrante.nome}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
