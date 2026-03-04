import EventNavbar from "@/shared/components/navigation/EventNavbar"
import EventBanner from "@/shared/components/displays/EventBanner"
import { NavigationLoadingProvider } from "@/shared/contexts/NavigationLoadingContext"
import logoIFMS from "@/assets/logoifmspp.png"

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
        <NavigationLoadingProvider>
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
                        <img width={150} src="https://projetosifms.com.br/sct2025/imagens/logoifmspp.png" alt="" />
                        <p>Desenvolvido por <a href="https://github.com/carloscacho" target="_blank" rel="noopener noreferrer">Carlos Emilio de Andrade Cacho</a></p>
                        <p>© {new Date().getFullYear()} IFMS - Instituto Federal de Mato Grosso do Sul</p>
                    </aside>
                </footer>
            </div>
        </NavigationLoadingProvider>
    )
}
