import Link from "next/link";
import React from "react";
import { MdOutlineGroups2 } from "react-icons/md";
import { SiGoogleclassroom } from "react-icons/si";

const Drawer = ({ children }) => {
    return (
        <div className="drawer md:drawer-close lg:drawer-open">

            <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content flex flex-col items-center justify-center">
                {children}
            </div>
            <div className="drawer-side">
                <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay">

                </label>
                
                <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4">
                <h3 className="text-3xl">IFMS Eventos <span className="text-sm">v: 1.0</span></h3>
                    <li><MdOutlineGroups2 /><Link href='/admin/turmas' >Turma</Link></li>
                    <li><SiGoogleclassroom /><Link href='/admin/salas' >Sala</Link></li>

                </ul>
            </div>
        </div>


    )
}

export default Drawer