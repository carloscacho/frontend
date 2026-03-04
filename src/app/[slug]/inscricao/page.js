import RegistrationView from "@/shared/components/screens/RegistrationView";
import { eventoService } from "@/modules/eventos/services/evento.service";

export default async function InscricaoPage({ params }) {
    const { slug } = await params;

    let evento = null;
    try {
        evento = await eventoService.getBySlug(slug);
    } catch (error) {
        console.error("Error fetching evento:", error);
    }

    if (!evento) {
        return <div className="text-center py-10">Evento não encontrado</div>;
    }

    return (
        <RegistrationView evento={evento} />
    );
}
