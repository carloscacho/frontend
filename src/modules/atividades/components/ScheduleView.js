'use client'
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSchedule } from '@/modules/atividades/hooks/useSchedule';
import DateTabs from './DateTabs';
import ActivityCard from './ActivityCard';
import QrScannerModal from './QrScannerModal';
import { PiSunHorizonDuotone, PiSunDuotone, PiMoonStarsDuotone } from 'react-icons/pi';

const PERIODS = [
    { key: 'matutino', label: 'Matutino', icon: PiSunHorizonDuotone, minHour: 0, maxHour: 12 },
    { key: 'vespertino', label: 'Vespertino', icon: PiSunDuotone, minHour: 12, maxHour: 18 },
    { key: 'noturno', label: 'Noturno', icon: PiMoonStarsDuotone, minHour: 18, maxHour: 24 },
];

/**
 * Extracts the earliest start time (in total minutes since midnight, UTC)
 * from sessions matching the selected date tab.
 */
function getEarliestMinutesForDate(atividade, selectedDate) {
    let earliest = Infinity;
    atividade.data_atividade?.forEach(da => {
        const date = new Date(da.data);
        const formattedDate = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });
        if (formattedDate === selectedDate && da.hora) {
            const horaDate = new Date(da.hora);
            const totalMinutes = horaDate.getUTCHours() * 60 + horaDate.getUTCMinutes();
            if (totalMinutes < earliest) {
                earliest = totalMinutes;
            }
        }
    });
    return earliest;
}

export default function ScheduleView({ atividades, evento }) {
    const {
        dates,
        selectedDate,
        setSelectedDate,
        filteredAtividades,
        isRegistered,
        handleParticipar,
        conflictErrors,
        usuario
    } = useSchedule(atividades, evento);

    const router = useRouter();

    // Scanner Modal setup
    const scannerModalRef = useRef(null);
    const [scanningActivity, setScanningActivity] = useState(null);

    const handleOpenScanner = (atividade) => {
        setScanningActivity(atividade);
        scannerModalRef.current?.showModal();
    };

    const handleParticiparWithRefresh = async (atividade) => {
        const success = await handleParticipar(atividade);
        if (success) {
            router.refresh();
        }
    };

    // Group activities by period (Matutino / Vespertino / Noturno), sorted by start time
    const groupedByPeriod = useMemo(() => {
        // Sort all filtered activities by their earliest start time for the selected date
        const sorted = [...filteredAtividades].sort((a, b) => {
            return getEarliestMinutesForDate(a, selectedDate) - getEarliestMinutesForDate(b, selectedDate);
        });

        const groups = PERIODS.map(period => {
            const activities = sorted.filter(atividade => {
                const earliestMinutes = getEarliestMinutesForDate(atividade, selectedDate);
                const earliestHour = earliestMinutes / 60;
                return earliestHour >= period.minHour && earliestHour < period.maxHour;
            });
            return { ...period, activities };
        });

        // Only return periods that have activities
        return groups.filter(g => g.activities.length > 0);
    }, [filteredAtividades, selectedDate]);

    // Smooth Scroll and Highlight for anchor links
    useEffect(() => {
        const hash = typeof window !== 'undefined' ? window.location.hash : '';
        if (hash && hash.startsWith('#atividade-') && filteredAtividades.length > 0) {
            const hasActivityInCurrentTab = filteredAtividades.some(a => `atividade-${a.id_atividade}` === hash.substring(1));

            if (hasActivityInCurrentTab) {
                // Wait for the render phase to complete to guarantee DOM presence
                const timeoutId = setTimeout(() => {
                    const el = document.querySelector(hash);
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        // Brief glowing highlight effect
                        el.classList.add('ring-4', 'ring-primary', 'animate-pulse');
                        setTimeout(() => el.classList.remove('ring-4', 'ring-primary', 'animate-pulse'), 2500);
                    }
                }, 300);

                return () => clearTimeout(timeoutId);
            }
        }
    }, [filteredAtividades]);

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center mb-8 uppercase text-primary">Programação</h1>

            {!usuario && (
                <div className="alert alert-error mb-8">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <span>Para participar das atividades você deve fazer o login. Clique em Entrar e faça o login.</span>
                </div>
            )}

            <DateTabs
                dates={dates}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
            />

            <div className="space-y-4">
                {groupedByPeriod.map(period => {
                    const Icon = period.icon;
                    return (
                        <div key={period.key} className="collapse collapse-arrow bg-base-100 shadow-md rounded-xl border border-base-300">
                            <input type="checkbox" defaultChecked />
                            <div className="collapse-title flex items-center gap-3 text-lg font-bold">
                                <Icon className="w-6 h-6 text-primary" />
                                <span>{period.label}</span>
                                <span className="badge badge-primary badge-sm ml-1">{period.activities.length}</span>
                            </div>
                            <div className="collapse-content px-2 sm:px-4">
                                <div className="space-y-6 pt-2">
                                    {period.activities.map(atividade => (
                                        <ActivityCard
                                            key={atividade.id_atividade}
                                            atividade={atividade}
                                            evento={evento}
                                            isRegistered={isRegistered}
                                            onParticipar={handleParticiparWithRefresh}
                                            onScan={handleOpenScanner}
                                            conflictError={conflictErrors[atividade.id_atividade]}
                                            usuario={usuario}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {filteredAtividades.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        Nenhuma atividade encontrada para esta data.
                    </div>
                )}
            </div>
            <div className="flex justify-center mt-8 w-full overflow-x-auto">
                <DateTabs
                    dates={dates}
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                />
            </div>

            <QrScannerModal
                refModal={scannerModalRef}
                atividade={scanningActivity}
                onSuccess={() => router.refresh()}
            />
        </div>
    );
}
