import ScheduleView from "@/modules/atividades/components/ScheduleView";
import { eventoService } from "@/modules/eventos/services/evento.service";
import { atividadeService } from "@/modules/atividades/services/atividade.service";

export default async function ProgramacaoPage({ params }) {
    const { slug } = await params;

    let evento = null;
    try {
        evento = await eventoService.getBySlug(slug);
    } catch (e) {
        console.error("Error fetching evento:", e);
    }

    if (!evento) {
        return <div className="text-center py-10">Evento não encontrado</div>;
    }

    let atividades = [];
    try {
        atividades = await atividadeService.getAllByEvento(evento.id_evento);
    } catch (e) {
        console.error("Error fetching atividades:", e);
    }

    return (
        <ScheduleView atividades={atividades} evento={evento} />
    );
}
