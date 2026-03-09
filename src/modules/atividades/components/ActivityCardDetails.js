import {
    PiCalendarBlankDuotone,
    PiMapPinDuotone,
    PiUsersDuotone
} from 'react-icons/pi';
import { calculateEndTime } from '@/shared/utils/dateUtils';
import { formatTime, formatDateFull } from './activityCardUtils';

export default function ActivityCardDetails({
    atividade,
    vacancyInfo
}) {
    const {
        totalRegistered,
        isUnlimitedSpots,
        vagasRestantes,
        alunosNaListaEspera,
        limiteListaEspera,
        listaEsperaCheia
    } = vacancyInfo;

    return (
        <div className="space-y-3 md:space-y-4">
            {/* Date & Time */}
            {atividade.data_atividade?.map((da, index) => (
                <div key={index} className="flex items-center gap-2 text-sm md:text-lg">
                    <span className="text-gray-500"><PiCalendarBlankDuotone className="w-5 h-5" /></span>
                    <span>
                        <strong>{formatDateFull(da.data)}</strong> • {formatTime(da.hora)} às {calculateEndTime(da.data, da.hora, da.duracao)}
                    </span>
                </div>
            ))}
            <div className="divider divider-end"></div>

            {/* Location */}
            <div className="flex items-center gap-2 text-sm md:text-lg">
                <span className="text-gray-500"><PiMapPinDuotone className="w-5 h-5" /></span>
                <span>{atividade.sala?.nome || 'Local a definir'}</span>
            </div>
            <div className="divider divider-end">      </div>

            {/* Vacancies Counter */}
            <div className="flex items-center gap-2 text-sm md:text-lg">
                <span className="text-gray-500"><PiUsersDuotone className="w-5 h-5" /></span>
                <div className="flex flex-wrap items-center gap-2">
                    <span className="badge badge-outline">{totalRegistered} inscritos</span>
                    {isUnlimitedSpots ? (
                        <span className="badge badge-info badge-outline">Vagas ilimitadas</span>
                    ) : vagasRestantes > 0 ? (
                        <span className="badge badge-success badge-outline">{vagasRestantes} vagas restantes</span>
                    ) : (
                        <span className="badge badge-error badge-outline">Vagas esgotadas</span>
                    )}
                </div>
            </div>

            {/* Waiting List Counter */}
            {!isUnlimitedSpots && vagasRestantes === 0 && (
                <div className="flex items-center gap-2 text-sm md:text-lg ml-6">
                    <span className="badge badge-warning">{alunosNaListaEspera}/{limiteListaEspera} na lista de espera</span>
                    {listaEsperaCheia && (
                        <span className="badge badge-error badge-outline">Lista de espera cheia</span>
                    )}
                </div>
            )}
        </div>
    );
}
