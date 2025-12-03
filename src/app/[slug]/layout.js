import EventNavbar from "@/app/_components/navigation/EventNavbar"
import EventBanner from "@/app/_components/EventBanner"

async function getEvento(slug) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4455';
    const res = await fetch(`${apiUrl}/evento/slug/${slug}`, {
        next: { revalidate: 3600 }
    });

    if (!res.ok) {
        return null;
    }

    return res.json();
}

export default async function EventLayout({ children, params }) {
    const { slug } = await params
    const evento = await getEvento(slug)

    if (!evento) return <div className="flex justify-center items-center h-screen">Evento não encontrado</div>

    return (
        <div className="min-h-screen flex flex-col bg-base-100">
            {/* Banner */}
            <EventBanner evento={evento} />

            {/* Navigation Menu (Client Component) */}
            <EventNavbar evento={evento} />

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8 flex-grow">
                {children}
            </main>

            {/* Footer */}
            <footer className="footer footer-center p-10 bg-base-200 text-base-content rounded">
                <aside>
                    <p>Copyright © {new Date().getFullYear()} - Todos os direitos reservados por {evento.nome}</p>
                </aside>
            </footer>
        </div>
    )
}
