'use client'
import { useEffect } from 'react';
import { usePathname, useParams } from 'next/navigation';

export default function AppTitleUpdater() {
    const pathname = usePathname();
    const params = useParams();

    useEffect(() => {
        if (!pathname) return;

        let title = "IFMS Eventos";

        let pathParts = pathname.split('/').filter(Boolean);
        if (pathParts.length === 0) {
            document.title = title;
            return;
        }

        const isSlugRoute = params && params.slug;

        if (pathParts[0].toLowerCase() === 'admin') {
            const pageRaw = pathParts.length > 1 ? pathParts[1] : 'Home';
            const page = pageRaw.charAt(0).toUpperCase() + pageRaw.slice(1).replace(/-/g, ' ');
            title = `IFMS Eventos - Admin - ${page}`;
        } else if (isSlugRoute) {
            const slug = params.slug.toUpperCase();

            let pageRaw = 'Home';
            // Em rotas baseadas em [slug], o primeiro nível da URL geralmente é o slug
            if (pathParts.length > 1 && pathParts[0] === params.slug) {
                pageRaw = pathParts[1];
            }

            // Tratamentos e formatação de nomes específicos da rota da área pública
            if (pageRaw === 'minha-area') pageRaw = 'Minha Área';
            else if (pageRaw === 'programacao') pageRaw = 'Programação';
            else if (pageRaw === 'inscricao') pageRaw = 'Inscrição';
            else if (pageRaw === 'login') pageRaw = 'Login';
            else pageRaw = pageRaw.charAt(0).toUpperCase() + pageRaw.slice(1).replace(/-/g, ' ');

            title = `${slug} - ${pageRaw}`;
        }

        document.title = title;
    }, [pathname, params]);

    return null;
}
