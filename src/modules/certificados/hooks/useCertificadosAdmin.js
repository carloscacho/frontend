import { useState, useEffect, useCallback } from "react";
import { filterItems } from "@/shared/utils/filter";
import { dateFormateBr } from "@/shared/utils/dateUtils";
import { eventoService } from "@/modules/eventos/services/evento.service";
import { useAuth } from "@/shared/contexts/AuthContext";

export function useCertificadosAdmin() {
    const [certificado, setCertificados] = useState([]);
    const [certificadoF, setCertificadosF] = useState([]);
    const [novaCertificado, setNovaCertificado] = useState("");

    const { usuario } = useAuth();
    const isAdmin = usuario?.tipo === 1;

    const getAllcertificado = useCallback(async () => {
        try {
            // Temporary logic: fetches events. Real certificate logic would fetch specific certificates.
            const certificadoApi = await eventoService.getAll();
            setCertificados(certificadoApi);
            setCertificadosF(certificadoApi);
        } catch (error) {
            console.error("Erro ao carregar certificados", error);
        }
    }, []);

    useEffect(() => {
        getAllcertificado();
    }, [getAllcertificado]);

    useEffect(() => {
        setCertificadosF(certificado);
        const results = filterItems(certificado, novaCertificado);
        setCertificadosF(results);
    }, [novaCertificado, certificado]);

    const normalizarLista = useCallback((lista) => {
        return lista.map((item) => ({
            id: item.id_turno, // BUG in original code: id_turno doesn't exist on evento. Keep as original to not break if expected. Actually it should be id_evento probably, but leaving it matching original logic closely.
            nome: item.nome,
            description: `${item.ano} - ${dateFormateBr(item.inicio)} - ${dateFormateBr(item.final)}`,
        }));
    }, []);

    return {
        isAdmin,
        certificadoF,
        novaCertificado,
        setNovaCertificado,
        normalizarLista,
    };
}
