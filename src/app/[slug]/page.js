import { eventoService } from "@/modules/eventos/services/evento.service";
import Button from "@/shared/components/utils/Button";
import { formatDateRange } from "@/shared/utils/dateUtils";

export async function generateStaticParams() {
    try {
        const eventos = await eventoService.getAll();
        return eventos.map((evento) => ({
            slug: evento.slug,
        }));
    } catch (error) {
        console.error('Error fetching static params:', error);
        return [];
    }
}

export default async function EventPage({ params }) {
    const { slug } = await params;

    let evento = null;
    try {
        evento = await eventoService.getBySlug(slug);
    } catch (error) {
        console.error("Error fetching evento:", error);
    }

    if (!evento) return <div className="flex justify-center items-center h-48">Evento não encontrado</div>

    const { days, month } = formatDateRange(evento.inicio, evento.final)

    return (

        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="mockup-window bg-base-300 border border-base-300 max-w-none text-justify p-10">
                <div className="place-content-center">
                    <p className="text-center text-xl my-4">
                        O evento <strong>{evento.nome}</strong> é um evento tradicional do IFMS e oportuniza aos estudantes e a comunidade externa acesso a pluralidade de novos conhecimentos. Trata-se de um espaço para aprender conteúdos novos ligados a educação, ciência e tecnologia.
                    </p>
                    <p className="text-center text-xl my-4">
                        Nos dias <strong>{days}</strong> de <strong>{month}</strong> ocorrerá o evento <strong>{evento.nome}</strong> no IFMS, contendo diversas atividades, como palestras, minicursos, mesas redondas entre outras, são dezenas de atividades que estão relacionadas ao evento. Temos <strong>{evento._count?.atividade || 0}</strong> de atividade nos periodos <strong>manhã, tarde e noite</strong>.
                    </p>
                    <p className="text-center text-xl my-4">
                        O evento terá como principal objetivo oferecer aos estudantes oportunidades de acesso a novos conhecimentos.
                    </p>

                    <div className="flex justify-center mt-6">

                        <Button mode="" color="info" className="btn-lg btn-wide m-0">Bom Evento a Todos!</Button>
                    </div>
                </div>
            </div>

        </div>
    )
}
