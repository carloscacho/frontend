'use client'
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link"
import { PiSunDuotone, PiMoonDuotone } from "react-icons/pi";

export default function EventNavbar({ evento }) {
    const [theme, setTheme] = useState("cmyk");
    const [isSticky, setIsSticky] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const sentinelRef = useRef(null);

    useEffect(() => {
        const storedTheme = localStorage.getItem("theme") || "cmyk";
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

    function toggleTheme() {
        const newTheme = theme === "cmyk" ? "forest" : "cmyk";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        document.querySelector("html").setAttribute("data-theme", newTheme);
    }

    return (
        <>
            <div ref={sentinelRef} className="h-px w-full h-full invisible" />
            <div
                className={`sticky top-0 z-50 transition-all duration-300 ${isSticky
                    ? 'shadow-lg bg-opacity-95 backdrop-blur-sm py-2'
                    : 'py-4'
                    }`}
                style={{
                    backgroundColor: isSticky ? (evento.cor_primaria || '') : (evento.cor_primaria || ''),
                }}
            >
                <div className="container-full mx-auto px-4">
                    <div className="navbar min-h-0">
                        <div className="navbar-start">
                            <button onClick={() => setIsDrawerOpen(true)} className="btn btn-ghost lg:hidden">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
                            </button>
                            <Link href={`/${evento.slug}`} className={`btn btn-ghost transition-all duration-300 text-xl lg:text-2xl`}>
                                <span className="lg:hidden uppercase">{evento.slug}</span>
                                <span className="hidden lg:inline uppercase">{evento.nome}</span>
                            </Link>
                        </div>
                        <div className="navbar-center hidden lg:flex">
                            <ul className="menu menu-horizontal px-1 text-lg">
                                <li><Link href={`/${evento.slug}`}>Apresentação</Link></li>
                                <li><Link href={`/${evento.slug}/programacao`}>Programação</Link></li>
                                <li><Link href={`/${evento.slug}/inscricao`}>Inscreva-se</Link></li>
                            </ul>
                        </div>
                        <div className="navbar-end gap-2">
                            <button onClick={toggleTheme} className="btn btn-ghost btn-circle">
                                {theme === "cmyk" ? (
                                    <PiSunDuotone size={24} />
                                ) : (
                                    <PiMoonDuotone size={24} />
                                )}
                            </button>
                            <Link href="/login" className="btn btn-primary text-xl">Login</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Drawer / Sidebar */}
            {isDrawerOpen && (
                <div className="fixed inset-0 z-[60]">
                    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsDrawerOpen(false)}></div>
                    <div className="absolute left-0 top-0 h-full w-80 bg-base-100 p-4 shadow-lg overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold uppercase">{evento.slug}</h2>
                            <button onClick={() => setIsDrawerOpen(false)} className="btn btn-ghost btn-circle">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <ul className="menu text-xl font-bold space-y-2">
                            <li><Link href={`/${evento.slug}`} onClick={() => setIsDrawerOpen(false)}>Apresentação</Link></li>
                            <li><Link href={`/${evento.slug}/programacao`} onClick={() => setIsDrawerOpen(false)}>Programação</Link></li>
                            <li><Link href={`/${evento.slug}/inscricao`} onClick={() => setIsDrawerOpen(false)}>Inscreva-se</Link></li>
                            <li><Link href="/login" onClick={() => setIsDrawerOpen(false)}>Login</Link></li>
                        </ul>
                    </div>
                </div>
            )}
        </>
    )
}
