'use client'
import { createContext, useContext, useState, useEffect } from "react";
import { eventoService } from "@/modules/eventos/services/evento.service";
import { useAuth } from "@/shared/contexts/AuthContext";

const EventFilterContext = createContext();

export function EventFilterProvider({ children }) {
    const [eventoOptions, setEventoOptions] = useState([]);
    const [eventoSelect, setEventoSelect] = useState({});
    const { usuario } = useAuth() || {};

    useEffect(() => {
        async function getAllEventos() {
            try {
                let eventoApi = await eventoService.getAll();
                if (usuario?.tipo === 4) {
                    eventoApi = eventoApi.filter(ev => ev.fk_usuario_responsavel === usuario.id_usuario);
                }
                setEventoOptions(eventoApi);
                if (eventoApi && eventoApi.length > 0) {
                    const sortedEventos = [...eventoApi].sort((a, b) => a.id_evento - b.id_evento);
                    const lastEvent = sortedEventos[sortedEventos.length - 1];
                    setEventoSelect(lastEvent);
                } else {
                    setEventoSelect({});
                }
            } catch (error) {
                console.error("Erro ao carregar eventos no filtro:", error);
            }
        }
        getAllEventos();
    }, [usuario]);

    return (
        <EventFilterContext.Provider value={{ eventoOptions, eventoSelect, setEventoSelect }}>
            {children}
        </EventFilterContext.Provider>
    );
}

export function useEventFilter() {
    return useContext(EventFilterContext);
}
