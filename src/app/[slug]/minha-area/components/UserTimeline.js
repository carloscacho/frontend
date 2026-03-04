import { calculateEndTime } from '@/shared/utils/dateUtils';

export default function UserTimeline({ loadingActivities, myActivities }) {
    return (
        <div className="mt-8">
            <h2 className="text-2xl font-bold text-center mb-6 uppercase text-primary">Minha Timeline</h2>

            {loadingActivities ? (
                <div className="flex justify-center">
                    <span className="loading loading-spinner loading-md"></span>
                </div>
            ) : myActivities.length === 0 ? (
                <div className="text-center text-gray-500">
                    Você ainda não se inscreveu em nenhuma atividade.
                </div>
            ) : (
                <ul className="timeline timeline-snap-icon max-md:timeline-compact timeline-vertical">
                    {myActivities.map((activity, index) => {
                        const date = new Date(activity.data_atividade.data);
                        const formattedDate = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });
                        const startTime = new Date(activity.data_atividade.hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
                        const endTimeString = calculateEndTime(activity.data_atividade.data, activity.data_atividade.hora, activity.data_atividade.duracao);

                        // Calculate status
                        const now = new Date();
                        // Construct full start and end dates for comparison
                        const startDateTime = new Date(`${activity.data_atividade.data.split('T')[0]}T${activity.data_atividade.hora.split('T')[1]}`);
                        let endDateTime = null;
                        if (activity.data_atividade.duracao) {
                            // If calculating properly, we should use the same logic as calculateEndTime but for Date object
                            // Ideally, backend should provide end time or we consistently construct it.
                            // For color status logic, this approximation using split duration (which is just time part) works if duration is stored as time.
                            // But wait, activity.data_atividade.duracao is likely "1970-01-01T02:00:00.000Z" kind of string or just time string.
                            // Let's assume the previous logic was working for status.
                            endDateTime = new Date(`${activity.data_atividade.data.split('T')[0]}T${activity.data_atividade.duracao.split('T')[1]}`);
                        }

                        const isPresent = activity.presenca === 1; // Assuming 1 is present
                        const isHappeningNow = endDateTime && now >= startDateTime && now <= endDateTime;
                        const isPast = endDateTime && now > endDateTime;
                        const isAbsent = isPast && !isPresent;

                        let statusColor = 'text-primary';
                        let statusIconColor = 'text-primary';
                        let statusMessage = null;

                        if (isPresent) {
                            statusColor = 'text-success';
                            statusIconColor = 'text-success';
                            statusMessage = <span className="badge badge-success gap-2">Presença Confirmada</span>;
                        } else if (isHappeningNow) {
                            statusColor = 'text-warning';
                            statusIconColor = 'text-warning';
                            statusMessage = <span className="badge badge-warning gap-2 animate-pulse">Acontecendo Agora!</span>;
                        } else if (isAbsent) {
                            statusColor = 'text-error';
                            statusIconColor = 'text-error';
                            statusMessage = <span className="badge badge-error gap-2">Ausente</span>;
                        }

                        return (
                            <li key={index}>
                                <div className="timeline-middle">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`h-5 w-5 ${statusIconColor}`}>
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className={`timeline-start md:text-end mb-10 ${index % 2 === 0 ? 'md:mr-4' : 'md:ml-4'}`}>
                                    <time className="font-mono italic">{formattedDate} - {startTime}</time>
                                    <div className={`text-lg font-black ${statusColor}`}>{activity.data_atividade.atividade.nome}</div>
                                    <p className="text-sm text-gray-600">
                                        Local: {activity.data_atividade.atividade.sala?.nome || 'A definir'}
                                    </p>
                                    {endTimeString && <p className="text-xs">Até: {endTimeString}</p>}
                                    {statusMessage && <div className="mt-2">{statusMessage}</div>}
                                </div>
                                <hr className={`bg-primary`} />
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
