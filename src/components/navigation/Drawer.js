'use client';
import Link from "next/link";
import React from "react";
import { MdOutlineGroups2 } from "react-icons/md";
import { SiGoogleclassroom, SiGoogletasks  } from "react-icons/si";
import { TbSunMoon } from "react-icons/tb";
import { PiUsersDuotone, PiCertificateDuotone, PiCalendarCheckDuotone,PiChalkboardTeacherDuotone   } from "react-icons/pi";

import { useDrawer } from "@/context/DrawerContext";

const Drawer = ({ children }) => {

    const {drawer} = useDrawer()

    return (
        <div className={ drawer ? "drawer drawer-open fixed mt-12" : "drawer drawer-close"}>

            <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content flex flex-col items-center justify-center">
                {children}
            </div>
            <div className="drawer-side">
                <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay">

                </label>
                
                <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4">
                
                    <li className="text-lg"><Link href='/admin/atividades' ><SiGoogletasks  />Atividades</Link></li>
                    <li className="text-lg"><Link href='/admin/certificados' ><PiCertificateDuotone  />Certificados</Link></li>
                    <li className="text-lg"><Link href='/admin/eventos' ><PiCalendarCheckDuotone  />Eventos</Link></li>
                    <li className="text-lg"><Link href='/admin/palestrantes' ><PiChalkboardTeacherDuotone  />Palestrantes</Link></li>
                    <li className="text-lg"><Link href='/admin/salas' ><SiGoogleclassroom />Salas</Link></li>
                    <li className="text-lg"><Link href='/admin/turmas' ><MdOutlineGroups2 />Turmas</Link></li>
                    <li className="text-lg"><Link href='/admin/turnos' ><TbSunMoon />Turnos</Link></li>
                    <li className="text-lg"><Link href='/admin/usuarios' ><PiUsersDuotone />Usuários</Link></li>

                </ul>
            </div>
        </div>


    )
}

export default Drawer