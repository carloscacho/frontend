'use client'
import { createContext, useContext, useState, useEffect } from "react";
import { getAllRecords } from "@/utils/crud";

const EventFilterContext = createContext();

export function EventFilterProvider({ children }) {
    const [eventoOptions, setEventoOptions] = useState([]);
    const [eventoSelect, setEventoSelect] = useState({});

    useEffect(() => {
        async function getAllEventos() {
            const eventoApi = await getAllRecords('/evento');
            setEventoOptions(eventoApi);
            if (eventoApi && eventoApi.length > 0) {
                const sortedEventos = [...eventoApi].sort((a, b) => a.id_evento - b.id_evento);
                const lastEvent = sortedEventos[sortedEventos.length - 1];
                setEventoSelect(lastEvent);
            }
        }
        getAllEventos();
    }, []);

    return (
        <EventFilterContext.Provider value={{ eventoOptions, eventoSelect, setEventoSelect }}>
            {children}
        </EventFilterContext.Provider>
    );
}

export function useEventFilter() {
    return useContext(EventFilterContext);
}
