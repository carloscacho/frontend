import RegistrationView from "@/app/_components/screens/RegistrationView";

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

export default async function InscricaoPage({ params }) {
    const { slug } = await params;
    const evento = await getEvento(slug);

    if (!evento) {
        return <div className="text-center py-10">Evento não encontrado</div>;
    }

    return (
        <RegistrationView evento={evento} />
    );
}
