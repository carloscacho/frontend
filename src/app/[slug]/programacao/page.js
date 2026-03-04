import ScheduleView from "./components/ScheduleView";

async function getEvento(slug) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4455';
    try {
        const res = await fetch(`${apiUrl}/evento/slug/${slug}`, { next: { revalidate: 60 } });
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        console.error("Error fetching evento:", error);
        return null;
    }
}

async function getAtividades(id_evento) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4455';
    try {
        const res = await fetch(`${apiUrl}/atividade/full/${id_evento}`, { next: { revalidate: 60 } });
        if (!res.ok) return [];
        return res.json();
    } catch (error) {
        console.error("Error fetching atividades:", error);
        return [];
    }
}

export default async function ProgramacaoPage({ params }) {
    const { slug } = await params;
    const evento = await getEvento(slug);

    if (!evento) {
        return <div className="text-center py-10">Evento não encontrado</div>;
    }

    const atividades = await getAtividades(evento.id_evento);

    return (
        <ScheduleView atividades={atividades} evento={evento} />
    );
}
