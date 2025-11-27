'use client';
import Link from "next/link";
import React from "react";
import { MdOutlineGroups2 } from "react-icons/md";
import { SiGoogleclassroom, SiGoogletasks } from "react-icons/si";
import { TbSunMoon } from "react-icons/tb";
import { PiUsersDuotone, PiCertificateDuotone, PiCalendarCheckDuotone, PiChalkboardTeacherDuotone, PiHome } from "react-icons/pi";

import { useDrawer } from "@/context/DrawerContext";
import Image from "next/image";
import logoIFEventos from "../../../assets/logoIFEventosnbg.png"

const Drawer = ({ children }) => {

    const { drawer } = useDrawer()

    const menuItems = [
        { name: "Atividades", icon: <SiGoogletasks size={24} />, path: "/admin/atividades" },
        { name: "Certificados", icon: <PiCertificateDuotone size={24} />, path: "/admin/certificados" },
        { name: "Eventos", icon: <PiCalendarCheckDuotone size={24} />, path: "/admin/eventos" },
        { name: "Palestrantes", icon: <PiChalkboardTeacherDuotone size={24} />, path: "/admin/palestrantes" },
        { name: "Salas", icon: <SiGoogleclassroom size={24} />, path: "/admin/salas" },
        { name: "Turmas", icon: <MdOutlineGroups2 size={24} />, path: "/admin/turmas" },
        { name: "Turnos", icon: <TbSunMoon size={24} />, path: "/admin/turnos" },
        { name: "Usuários", icon: <PiUsersDuotone size={24} />, path: "/admin/usuarios" },
    ];

    return (
        <div className="drawer drawer-open fixed mt-12 overflow-visible">

            <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content flex flex-col items-center justify-center relative z-0">
                {children}
            </div>
            <div className={`drawer-side absolute z-30 ${!drawer ? "overflow-visible" : ""}`}>
                <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay">

                </label>

                <ul className={`menu bg-base-200 text-base-content min-h-full pt-8 p-4 transition-all duration-300 ${drawer ? "w-80" : "w-20 overflow-visible"}`}>
                    <li>
                        <Link href="/admin" className="flex items-center p-2">
                            <span className="text-xl"><Image width={32} height={32} src={logoIFEventos} alt="logo do IFMS Eventos" /></span>
                            <span className={`ml-2 text-lg font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${drawer ? "opacity-100 inline" : "opacity-0 hidden w-0"}`}>Inicio</span>
                        </Link>
                    </li>
                    {menuItems.map((item, index) => (
                        <li key={index} className="mb-2">
                            <Link
                                href={item.path}
                                className={`flex items-center p-2 ${!drawer ? "tooltip tooltip-top z-50" : ""}`}
                                data-tip={item.name}
                            >
                                <span className="text-xl">{item.icon}</span>
                                <span className={`ml-4 text-lg font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${drawer ? "opacity-100 inline" : "opacity-0 hidden w-0"}`}>
                                    {item.name}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default Drawer