'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { MdOutlineGroups2 } from "react-icons/md";
import { SiGoogleclassroom, SiGoogletasks } from "react-icons/si";
import { TbSunMoon } from "react-icons/tb";
import { PiUsersDuotone, PiCertificateDuotone, PiCalendarCheckDuotone, PiChalkboardTeacherDuotone, PiHouseDuotone, PiChartBarDuotone } from "react-icons/pi";

import { useDrawer } from "@/shared/contexts/DrawerContext";
import { useAuth } from "@/shared/contexts/AuthContext";

const Drawer = ({ children }) => {

    const { drawer } = useDrawer()
    const pathname = usePathname()
    const { usuario } = useAuth()

    const isResponsavel = usuario?.tipo === 4;

    const menuItems = [
        { name: "Home", icon: <PiHouseDuotone size={24} />, path: "/admin/home" },
        { name: "Eventos", icon: <PiCalendarCheckDuotone size={24} />, path: "/admin/eventos" },
        { name: "Atividades", icon: <SiGoogletasks size={24} />, path: "/admin/atividades" },
        { name: "Palestrantes", icon: <PiChalkboardTeacherDuotone size={24} />, path: "/admin/palestrantes" },
        { name: "Certificados", icon: <PiCertificateDuotone size={24} />, path: "/admin/certificados" },
        { name: "Salas", icon: <SiGoogleclassroom size={24} />, path: "/admin/salas" },
        { name: "Turmas", icon: <MdOutlineGroups2 size={24} />, path: "/admin/turmas" },
        { name: "Turnos", icon: <TbSunMoon size={24} />, path: "/admin/turnos" },
        { name: "Usuários", icon: <PiUsersDuotone size={24} />, path: "/admin/usuarios" },
        { name: "Relatórios", icon: <PiChartBarDuotone size={24} />, path: "/admin/relatorios" },
    ];

    const filteredMenuItems = isResponsavel
        ? menuItems.filter(item => 
            item.path === "/admin/home" || 
            item.path === "/admin/atividades" || 
            item.path === "/admin/palestrantes" || 
            item.path === "/admin/relatorios"
          )
        : menuItems;

    if (pathname === "/admin") {
        return (
            <div className="drawer drawer-open fixed mt-16 overflow-visible">
                <div className="drawer-content relative z-0 w-full h-full">
                    {children}
                </div>
            </div>
        )
    }

    return (
        <div className="drawer drawer-open fixed mt-16 overflow-visible w-full h-[calc(100vh-4rem)]">
            <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content relative z-0 w-full h-full overflow-y-auto">
                {children}
            </div>
            <div className={`drawer-side absolute z-30 h-full ${!drawer ? "overflow-visible" : ""}`}>
                <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay">

                </label>

                <ul className={`menu bg-base-200 text-base-content min-h-full pt-8 p-4 transition-all duration-300 ${drawer ? "w-60" : "w-20 overflow-visible"}`}>
                    {filteredMenuItems.map((item, index) => (
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