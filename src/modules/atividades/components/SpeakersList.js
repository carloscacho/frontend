'use client';
import { useState } from 'react';
import {
    PiMicrophoneDuotone,
    PiCaretDownDuotone,
    PiCaretUpDuotone
} from 'react-icons/pi';

const MAX_MOBILE_SPEAKERS = 3;

export default function SpeakersList({ speakers, corSecundaria }) {
    const [showAllSpeakers, setShowAllSpeakers] = useState(false);

    const hasManySpeakers = speakers.length > 4;
    const hasExtraSpeakersForMobile = speakers.length > MAX_MOBILE_SPEAKERS;
    const extraSpeakersCount = speakers.length - MAX_MOBILE_SPEAKERS;

    const SpeakerItem = ({ palestrante, isMobile = false }) => (
        <div
            className="flex items-center justify-between gap-2 bg-base-200 text-sm md:text-md rounded-lg px-3 py-2 hover:bg-base-300 transition-colors"
            title={palestrante.nome}
        >
            <span className={`font-medium ${isMobile ? 'truncate' : ''}`}>
                {palestrante.nome}
            </span>
            {palestrante.instituicao && (
                <span
                    className="badge badge-sm text-white flex-shrink-0"
                    style={{ backgroundColor: corSecundaria }}
                >
                    {palestrante.instituicao}
                </span>
            )}
        </div>
    );

    return (
        <div>
            <div className="flex items-center gap-2 mb-3">
                <span className="text-gray-500"><PiMicrophoneDuotone className="w-5 h-5" /></span>
                <span className="font-semibold text-sm md:text-lg">Ministrado por:</span>
            </div>

            {/* Desktop: Show all speakers */}
            <div className={`hidden md:flex flex-wrap gap-2 overflow-y-auto ${hasManySpeakers ? '' : 'flex-col'}`}>
                {speakers.map(palestrante => (
                    <SpeakerItem key={palestrante.id_palestrante} palestrante={palestrante} />
                ))}
            </div>

            {/* Mobile: Show limited speakers (max 3) with expand button */}
            <div className="md:hidden flex flex-col gap-2">
                {(showAllSpeakers ? speakers : speakers.slice(0, MAX_MOBILE_SPEAKERS)).map(palestrante => (
                    <SpeakerItem key={palestrante.id_palestrante} palestrante={palestrante} isMobile />
                ))}
                {hasExtraSpeakersForMobile && (
                    <button
                        onClick={() => setShowAllSpeakers(!showAllSpeakers)}
                        className="flex items-center gap-2 text-sm pl-1 py-1 rounded-full hover:bg-base-200 transition-colors"
                        style={{ color: corSecundaria }}
                    >
                        {showAllSpeakers ? (
                            <>
                                <PiCaretUpDuotone className="w-5 h-5" />
                                <span className="font-medium">Mostrar menos</span>
                            </>
                        ) : (
                            <>
                                <PiCaretDownDuotone className="w-5 h-5" />
                                <span className="font-medium">Ver mais {extraSpeakersCount} ministrante{extraSpeakersCount > 1 ? 's' : ''}</span>
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}
