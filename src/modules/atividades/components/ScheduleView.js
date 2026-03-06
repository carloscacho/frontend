'use client'
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSchedule } from '@/modules/atividades/hooks/useSchedule';
import DateTabs from './DateTabs';
import ActivityCard from './ActivityCard';
import QrScannerModal from './QrScannerModal';

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

            <div className="space-y-6">
                {filteredAtividades.map(atividade => (
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

                {filteredAtividades.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        Nenhuma atividade encontrada para esta data.
                    </div>
                )}
            </div>

            <QrScannerModal
                refModal={scannerModalRef}
                atividade={scanningActivity}
                onSuccess={() => router.refresh()}
            />
        </div>
    );
}
