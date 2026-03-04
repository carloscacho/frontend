
export async function generateStaticParams() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4455';
    try {
        const res = await fetch(`${apiUrl}/evento`);
        const eventos = await res.json();
        return eventos.map((evento) => ({
            slug: evento.slug,
        }));
    } catch (error) {
        console.error('Error fetching static params:', error);
        return [];
    }
}

async function getEvento(slug) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4455';
    const res = await fetch(`${apiUrl}/evento/slug/${slug}`, {
        next: { revalidate: 3600 } // Revalidate every hour
    });

    if (!res.ok) {
        return null;
    }

    return res.json();
}

export default async function EventPage({ params }) {
    const { slug } = await params;
    const evento = await getEvento(slug);

    if (!evento) return <div className="flex justify-center items-center h-48">Evento não encontrado</div>

    const formatDateRange = (start, end) => {
        const startDate = new Date(start)
        const endDate = new Date(end)
        const startDay = startDate.getDate() + 1
        const endDay = endDate.getDate() + 1
        const month = startDate.toLocaleString('pt-BR', { month: 'long' })

        if (startDate.getMonth() === endDate.getMonth()) {
            return { days: `${startDay} a ${endDay}`, month }
        } else {
            const endMonth = endDate.toLocaleString('pt-BR', { month: 'long' })
            return { days: `${startDay}`, month: `${month} a ${endDay} de ${endMonth}` }
        }
    }

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

                        <button className="btn btn-info btn-lg btn-wide">Bom Evento a Todos!</button>
                    </div>
                </div>
            </div>

        </div>
    )
}
