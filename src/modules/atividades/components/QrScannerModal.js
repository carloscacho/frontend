import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { useAlerta } from '@/shared/contexts/AlertContext';
import { PiXCircleDuotone, PiCameraSlashDuotone } from 'react-icons/pi';
import { inscricaoService } from '@/modules/inscricoes/services/inscricao.service';
import Button from '@/shared/components/utils/Button';

export default function QrScannerModal({ refModal, atividade, onSuccess }) {
    const { mostrarAlerta } = useAlerta();
    const qrRegionId = "qr-reader";
    const [scannerInit, setScannerInit] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
    const [feedback, setFeedback] = useState({ type: '', message: '' }); // type: 'success' | 'error' | ''
    const [cooldown, setCooldown] = useState(false);
    const html5QrCodeRef = useRef(null);
    const isTransitioningRef = useRef(false);

    // Auto-select session if there's only one
    useEffect(() => {
        if (atividade?.data_atividade?.length === 1) {
            setSelectedSession(atividade.data_atividade[0].id_data_atividade);
        } else {
            setSelectedSession(null); // Reset when activity changes
        }
    }, [atividade]);

    // Handle closing and stopping scanner
    const handleClose = useCallback(async () => {
        if (isTransitioningRef.current) return; // Prevent closing while starting/stopping

        isTransitioningRef.current = true;
        if (html5QrCodeRef.current && isScanning) {
            try {
                // Only stop if it is currently scanning (State 2 = SCANNING)
                if (html5QrCodeRef.current.getState && html5QrCodeRef.current.getState() === 2) {
                    await html5QrCodeRef.current.stop();
                }
                html5QrCodeRef.current.clear();
            } catch (err) {
                console.error("Failed to stop scanner", err);
            }
        }
        setIsScanning(false);
        setScannerInit(false);
        setFeedback({ type: '', message: '' });
        isTransitioningRef.current = false;
        refModal.current?.close();
    }, [isScanning, refModal]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (html5QrCodeRef.current && html5QrCodeRef.current.getState && html5QrCodeRef.current.getState() === 2) {
                try {
                    html5QrCodeRef.current.stop().catch(console.error);
                } catch (e) { }
            }
        };
    }, []);

    const onScanSuccess = useCallback(async (decodedText, decodedResult) => {
        if (cooldown || !selectedSession) return;

        const participanteId = parseInt(decodedText.trim(), 10);
        if (isNaN(participanteId)) {
            setFeedback({ type: 'error', message: 'QR Code Inválido.' });
            startCooldown();
            return;
        }

        try {
            // optimistic feedback
            setFeedback({ type: 'success', message: 'Processando...' });

            // Mark presence as true (1)
            await inscricaoService.updatePresence(selectedSession, participanteId, 1);

            // Success audio feedback could be added here
            setFeedback({ type: 'success', message: `Presença confirmada!` });

            if (onSuccess) {
                onSuccess(); // Refresh participant list in background
            }
        } catch (error) {
            console.error('Error recording presence:', error);
            let msg;
            if (error.response?.status === 404) {
                msg = 'Aluno não inscrito nesta atividade!';
            } else {
                msg = error.response?.data?.message || 'Erro ao confirmar presença.';
            }
            setFeedback({ type: 'error', message: msg });
        } finally {
            startCooldown();
        }
    }, [cooldown, selectedSession, onSuccess]);

    const startCooldown = () => {
        setCooldown(true);
        setTimeout(() => {
            setCooldown(false);
            setFeedback({ type: '', message: '' });
        }, 2000); // 2 seconds cooldown before next scan
    };

    const onScanSuccessRef = useRef(onScanSuccess);
    useEffect(() => {
        onScanSuccessRef.current = onScanSuccess;
    }, [onScanSuccess]);

    const startScanner = () => {
        if (!selectedSession) {
            mostrarAlerta('warning', 'Selecione uma sessão antes de iniciar.');
            return;
        }

        if (isScanning || isTransitioningRef.current) return;

        setIsScanning(true);
        isTransitioningRef.current = true;

        setTimeout(async () => {
            try {
                if (!html5QrCodeRef.current) {
                    html5QrCodeRef.current = new Html5Qrcode(qrRegionId);
                }

                const config = {
                    fps: 30,
                    qrbox: { width: 300, height: 300 },
                    formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
                };

                const videoConstraints = {
                    facingMode: "environment"
                };

                // Prefer back camera
                await html5QrCodeRef.current.start(
                    videoConstraints,
                    config,
                    (text, result) => onScanSuccessRef.current(text, result),
                    () => { } // Ignore scan failure callbacks (runs every frame)
                );

                setScannerInit(true);
            } catch (err) {
                console.error("Error starting scanner", err);
                mostrarAlerta('error', 'Não foi possível acessar a câmera. Verifique as permissões.');
                setIsScanning(false);
                setScannerInit(false);
            } finally {
                isTransitioningRef.current = false;
            }
        }, 150);
    };

    // Format session options for select
    const sessionOptions = atividade?.data_atividade?.map(session => {
        const date = new Date(session.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
        const time = new Date(session.hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
        return (
            <option key={session.id_data_atividade} value={session.id_data_atividade}>
                {date} às {time}
            </option>
        );
    });

    return (
        <dialog ref={refModal} className="modal modal-bottom sm:modal-middle">
            <div className="modal-box p-0 sm:p-6 sm:rounded-2xl max-h-[100vh] sm:max-h-[90vh] flex flex-col relative overflow-hidden bg-base-200">
                {/* Header */}
                <div className="bg-primary text-primary-content p-4 sm:rounded-t-xl flex justify-between items-center z-10 shadow-md">
                    <div>
                        <h3 className="font-bold text-lg">Leitor de QR Code</h3>
                        <p className="text-sm opacity-80 truncate max-w-[200px] sm:max-w-xs">{atividade?.nome}</p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="btn btn-ghost btn-sm btn-square hover:bg-white/20"
                    >
                        <PiXCircleDuotone size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">

                    {atividade?.data_atividade?.length > 1 && !isScanning && (
                        <div className="form-control w-full max-w-xs mb-4">
                            <label className="label">
                                <span className="label-text font-bold">Selecione a Sessão da Atividade</span>
                            </label>
                            <select
                                className="select select-bordered select-primary w-full"
                                value={selectedSession || ''}
                                onChange={(e) => setSelectedSession(e.target.value ? parseInt(e.target.value) : null)}
                            >
                                <option disabled value="">Escolha a sessão</option>
                                {sessionOptions}
                            </select>
                        </div>
                    )}

                    {!isScanning ? (
                        <div className="flex flex-col items-center justify-center h-64 w-full bg-base-100 rounded-xl mb-4 border-2 border-dashed border-base-300">
                            <PiCameraSlashDuotone size={48} className="text-base-300 mb-2" />
                            <p className="text-gray-500 mb-4 px-4 text-center">
                                Aponte a câmera para o QR-code do participante para confirmar a presença.
                            </p>
                            <Button
                                color="primary"
                                onClick={startScanner}
                                disabled={!selectedSession}
                            >
                                Iniciar Câmera
                            </Button>
                        </div>
                    ) : (
                        <div className="w-full relative max-w-sm mx-auto flex flex-col items-center">

                            {/* Visual Feedback Overlay */}
                            <div className={`absolute inset-0 z-10 flex items-center justify-center transition-opacity duration-300 rounded-xl pointer-events-none
                                ${feedback.type === 'success' ? 'bg-success/80 opacity-100' :
                                    feedback.type === 'error' ? 'bg-error/90 opacity-100' : 'opacity-0'}`}>
                                {feedback.message && (
                                    <div className="bg-white px-6 py-4 rounded-xl shadow-2xl transform scale-110 text-center">
                                        <p className={`text-xl font-black ${feedback.type === 'success' ? 'text-success' : 'text-error'}`}>
                                            {feedback.message}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Scanner Region */}
                            <div
                                id="qr-reader"
                                className="w-full overflow-hidden rounded-xl shadow-inner border-4 border-primary/20 bg-black"
                                style={{
                                    maxWidth: '400px',
                                    maskImage: 'radial-gradient(white, black)' // Smoothes corners slightly inside
                                }}
                            ></div>

                            <p className="mt-4 text-sm font-semibold opacity-70 animate-pulse text-center">
                                Escaneando... Aproxime o QR Code do celular do participante.
                            </p>

                            <Button
                                color="error"
                                mode="outline"
                                className="mt-6"
                                onClick={handleClose}
                            >
                                Parar Leitor
                            </Button>
                        </div>
                    )}
                </div>
            </div>
            {/* Backdrop click also closes */}
            <form method="dialog" className="modal-backdrop bg-base-300/60 backdrop-blur-sm">
                <button onClick={handleClose}>close</button>
            </form>
        </dialog>
    );
}
