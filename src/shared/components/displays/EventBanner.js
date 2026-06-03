'use client'
import { useEventTheme } from "@/shared/contexts/EventThemeContext";

export default function EventBanner({ evento: propEvento }) {
    let themeEvent = propEvento;
    try {
        const themeContext = useEventTheme();
        themeEvent = themeContext.themeEvent || propEvento;
    } catch (e) {
        // Fallback if rendered outside of provider
    }

    return (
        <div className="w-full relative">
            <img
                src={themeEvent.banner ? `http://localhost:4455${themeEvent.banner.startsWith('/') ? '' : '/'}${themeEvent.banner}` : "https://placehold.co/1920x400?text=Banner+Evento"}
                alt={themeEvent.nome}
                className="w-full h-auto object-contain"
            />
            {!themeEvent.banner && (
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-white text-center px-4">{themeEvent.nome}</h1>
                </div>
            )}
        </div>
    );
}
