'use client'
import { useState, useEffect, useRef } from "react";
import { PiSunDuotone, PiMoonDuotone } from "react-icons/pi";
import { useAuth } from "@/shared/contexts/AuthContext";
import { useAlerta } from "@/shared/contexts/AlertContext";
import { useNavigationLoading } from "@/shared/contexts/NavigationLoadingContext";
import { useEventTheme } from "@/shared/contexts/EventThemeContext";
import NavigationLink from "./NavigationLink";
import NavigationProgress from "./NavigationProgress";

// Utility function to adjust color brightness for gradients
function adjustColor(hex, percent) {
    if (!hex) return hex;
    // Remove # if present
    hex = hex.replace('#', '');

    // Parse RGB values
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    // Adjust brightness
    r = Math.min(255, Math.max(0, r + percent));
    g = Math.min(255, Math.max(0, g + percent));
    b = Math.min(255, Math.max(0, b + percent));

    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export default function EventNavbar({ evento }) {
    const [theme, setTheme] = useState("emerald");
    const [isSticky, setIsSticky] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const sentinelRef = useRef(null);
    const { usuario, logout } = useAuth();
    const { mostrarAlerta } = useAlerta();
    const { stopLoading } = useNavigationLoading();

    let themeEvent = evento;
    try {
        const themeContext = useEventTheme();
        themeEvent = themeContext.themeEvent || evento;
    } catch (e) {
        // Fallback if rendered outside of provider
    }

    // Cores do evento
    const corPrimaria = themeEvent.cor_primaria || '#32A041';
    const corSecundaria = themeEvent.cor_secundaria || corPrimaria;

    useEffect(() => {
        const storedTheme = localStorage.getItem("theme") || "emerald";
        setTheme(storedTheme);
        document.querySelector("html").setAttribute("data-theme", storedTheme);

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsSticky(!entry.isIntersecting && entry.boundingClientRect.top < 0);
            },
            { threshold: [1], rootMargin: '-1px 0px 0px 0px' }
        );

        if (sentinelRef.current) {
            observer.observe(sentinelRef.current);
        }

        return () => {
            if (sentinelRef.current) {
                observer.unobserve(sentinelRef.current);
            }
        };
    }, []);

    // Stop loading when component mounts (navigation complete)
    useEffect(() => {
        stopLoading();
    }, [stopLoading]);

    function toggleTheme() {
        const newTheme = theme === "emerald" ? "forest" : "emerald";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        document.querySelector("html").setAttribute("data-theme", newTheme);
    }

    const handleDrawerLinkClick = () => {
        setIsDrawerOpen(false);
    };

    return (
        <>
            <div ref={sentinelRef} className="h-px w-full invisible" />
            <div
                className={`sticky top-0 z-50 transition-all duration-500 ease-in-out ${isSticky
                    ? 'shadow-xl py-2'
                    : 'py-4'
                    }`}
                style={{
                    backgroundColor: corPrimaria,
                }}
            >
                <div className="container-full mx-auto px-4">
                    <div className={`navbar min-h-0 text-white transition-all duration-500 ${isSticky ? 'gap-4' : 'gap-6'}`}>
                        {/* Left - Logo/Event Name */}
                        <div className="navbar-start">
                            <button onClick={() => setIsDrawerOpen(true)} className="btn btn-ghost lg:hidden">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
                            </button>
                            <NavigationLink
                                href={`/${evento.slug}`}
                                className={`btn btn-ghost transition-all duration-500 ${isSticky ? 'text-lg lg:text-xl' : 'text-xl lg:text-2xl'}`}
                            >
                                <span className="lg:hidden uppercase font-bold">{evento.slug}</span>
                                <span className="hidden lg:inline uppercase font-bold">{evento.nome}</span>
                            </NavigationLink>
                        </div>

                        {/* Center - Navigation Links */}
                        <div className="navbar-center hidden lg:flex">
                            <ul className={`menu menu-horizontal px-1 transition-all duration-500 ${isSticky ? 'text-base gap-1' : 'text-lg gap-2'}`}>
                                <li>
                                    <NavigationLink
                                        href={`/${evento.slug}`}
                                        isNavLink={true}
                                        activeColor={corSecundaria}
                                        className="font-medium px-4 py-2"
                                    >
                                        Apresentação
                                    </NavigationLink>
                                </li>
                                <li>
                                    <NavigationLink
                                        href={`/${evento.slug}/programacao`}
                                        isNavLink={true}
                                        activeColor={corSecundaria}
                                        className="font-medium px-4 py-2"
                                    >
                                        Programação
                                    </NavigationLink>
                                </li>
                                {usuario && (
                                    <li>
                                        <NavigationLink
                                            href={`/${evento.slug}/minha-area`}
                                            isNavLink={true}
                                            activeColor={corSecundaria}
                                            className="font-medium px-4 py-2"
                                        >
                                            Minha Área
                                        </NavigationLink>
                                    </li>
                                )}
                            </ul>
                        </div>

                        {/* Right - Theme Toggle & User */}
                        <div className="navbar-end gap-2">
                            <button
                                onClick={toggleTheme}
                                className="btn btn-ghost btn-circle transition-transform duration-300 hover:scale-110"
                            >
                                {theme === "emerald" ? (
                                    <PiSunDuotone size={24} />
                                ) : (
                                    <PiMoonDuotone size={24} />
                                )}
                            </button>
                            {usuario ? (
                                <NavigationLink
                                    href={`/${evento.slug}/minha-area`}
                                    className={`btn btn-ghost normal-case transition-all duration-500 ${isSticky ? 'text-base' : 'text-lg'}`}
                                >
                                    Olá, {usuario.nome.split(' ')[0]} {usuario.nome.split(' ').pop()}
                                </NavigationLink>
                            ) : (
                                <NavigationLink
                                    href={`/${evento.slug}/login`}
                                    className={`btn border-0 text-white font-semibold transition-all duration-300 
                                               hover:scale-105 hover:shadow-lg ${isSticky ? 'text-lg' : 'text-xl'}
                                               entrar-btn`}
                                    style={{
                                        '--glow-color': corSecundaria,
                                        background: `linear-gradient(135deg, ${corSecundaria} 0%, ${adjustColor(corSecundaria, -20)} 100%)`,
                                    }}
                                >
                                    Entrar
                                </NavigationLink>
                            )}
                        </div>
                    </div>
                </div>

                {/* Progress bar below navbar */}
                <NavigationProgress corPrimaria={corSecundaria} />
            </div>

            {/* Drawer / Sidebar */}
            {isDrawerOpen && (
                <div className="fixed inset-0 z-[60]">
                    {/* Overlay with fade-in animation */}
                    <div
                        className="absolute inset-0 bg-black/50 animate-fade-in"
                        onClick={() => setIsDrawerOpen(false)}
                    />
                    {/* Drawer Content with slide-in animation */}
                    <div
                        className="absolute left-0 top-0 h-full w-80 bg-base-100 p-4 shadow-2xl overflow-y-auto 
                                   drawer-slide-enter"
                        style={{ borderRight: `3px solid ${corPrimaria}` }}
                    >
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-base-300">
                            <h2
                                className="text-2xl font-bold uppercase"
                                style={{ color: corPrimaria }}
                            >
                                {evento.slug}
                            </h2>
                            <button onClick={() => setIsDrawerOpen(false)} className="btn btn-ghost btn-circle">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <ul className="menu text-lg font-medium space-y-1">
                            <li>
                                <NavigationLink
                                    href={`/${evento.slug}`}
                                    onClick={handleDrawerLinkClick}
                                    isNavLink={true}
                                    activeColor={corPrimaria}
                                    className="py-3"
                                >
                                    Apresentação
                                </NavigationLink>
                            </li>
                            <li>
                                <NavigationLink
                                    href={`/${evento.slug}/programacao`}
                                    onClick={handleDrawerLinkClick}
                                    isNavLink={true}
                                    activeColor={corPrimaria}
                                    className="py-3"
                                >
                                    Programação
                                </NavigationLink>
                            </li>
                            {usuario && (
                                <li>
                                    <NavigationLink
                                        href={`/${evento.slug}/minha-area`}
                                        onClick={handleDrawerLinkClick}
                                        isNavLink={true}
                                        activeColor={corPrimaria}
                                        className="py-3"
                                    >
                                        Minha Área
                                    </NavigationLink>
                                </li>
                            )}

                            {/* Separator */}
                            <div className="divider my-2"></div>

                            {usuario ? (
                                <>
                                    <li className="menu-title text-base" style={{ color: corPrimaria }}>
                                        Olá, {usuario.nome}
                                    </li>
                                    {usuario.tipo === 1 && (
                                        <li>
                                            <NavigationLink href="/admin/home" className="py-3">
                                                Painel Admin
                                            </NavigationLink>
                                        </li>
                                    )}
                                    <li>
                                        <button
                                            onClick={() => { logout(); setIsDrawerOpen(false); }}
                                            className="btn btn-error btn-outline mt-2"
                                        >
                                            Sair
                                        </button>
                                    </li>
                                </>
                            ) : (
                                <li>
                                    <NavigationLink
                                        href={`/${evento.slug}/login`}
                                        onClick={handleDrawerLinkClick}
                                        className="btn mt-2"
                                        style={{ backgroundColor: corPrimaria, borderColor: corPrimaria, color: '#fff' }}
                                    >
                                        Entrar
                                    </NavigationLink>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            )}
        </>
    )
}

