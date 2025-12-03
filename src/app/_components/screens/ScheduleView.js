'use client'
import React, { useState, useMemo } from 'react';

export default function ScheduleView({ atividades, evento }) {
    // Extract unique dates from activities
    const dates = useMemo(() => {
        const allDates = new Set();
        atividades.forEach(atividade => {
            if (atividade.data_atividade && atividade.data_atividade.length > 0) {
                atividade.data_atividade.forEach(da => {
                    const date = new Date(da.data);
                    // Format as DD/MM
                    const formattedDate = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                    allDates.add(formattedDate);
                });
            }
        });
        return Array.from(allDates).sort();
    }, [atividades]);

    const [selectedDate, setSelectedDate] = useState(dates[0]);

    // Filter activities by selected date
    const filteredAtividades = useMemo(() => {
        if (!selectedDate) return [];
        return atividades.filter(atividade => {
            return atividade.data_atividade?.some(da => {
                const date = new Date(da.data);
                const formattedDate = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                return formattedDate === selectedDate;
            });
        });
    }, [atividades, selectedDate]);

    function formatTime(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }

    function formatDateFull(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center mb-8 uppercase text-primary">Programação</h1>

            {/* Date Tabs */}
            <div className="flex justify-center mb-8 space-x-2 overflow-x-auto">
                {dates.map(date => (
                    <button
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={`btn ${selectedDate === date ? 'btn-primary' : 'btn-outline btn-primary'} rounded-none`}
                    >
                        {date}
                    </button>
                ))}
            </div>

            {/* Activities List */}
            <div className="space-y-6">
                {filteredAtividades.map(atividade => (
                    <div key={atividade.id_atividade} className="card bg-base-100 shadow-xl border border-base-200">
                        {/* Card Header */}
                        <div className="bg-info text-info-content p-4">
                            <h2 className="card-title text-xl font-bold uppercase justify-center text-center">
                                {atividade.nome}
                            </h2>
                        </div>

                        {/* Card Body */}
                        <div className="card-body p-6">
                            <p className="mb-4 text-justify">{atividade.descricao}</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    {atividade.data_atividade?.map((da, index) => (
                                        <div key={index} className="mb-2">
                                            <p><strong>Data:</strong> {formatDateFull(da.data)} - {formatTime(da.hora)} às {da.duracao ? formatTime(da.duracao) : '...'}</p>
                                        </div>
                                    ))}
                                    <p><strong>Local:</strong> {atividade.sala?.nome || 'A definir'}</p>
                                    <p><strong>Vagas:</strong> {atividade.max_participantes || 0}</p>
                                    <p><strong>Alunos em lista de Espera:</strong> 0</p> {/* Placeholder as per image */}
                                </div>

                                <div>
                                    <p className="font-bold mb-1">Ministrado por:</p>
                                    <ul className="list-none">
                                        {atividade.palestrante_atividade?.map(pa => (
                                            <li key={pa.palestrante.id_palestrante} className="mb-1">
                                                {pa.palestrante.nome}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredAtividades.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        Nenhuma atividade encontrada para esta data.
                    </div>
                )}
            </div>
        </div>
    );
}
