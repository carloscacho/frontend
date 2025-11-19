'use client'
import { useDrawer } from "@/context/DrawerContext";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { PiUserCircleDashedDuotone, PiUserCircleCheckDuotone  } from "react-icons/pi";



export default function Navbar() {
    const { trocarDrawer } = useDrawer()
    const { logout, usuario } = useAuth()
    const router = useRouter()

    function _handleLogout() {
        if (usuario)
            logout()
        router.push("/")
    }

    return (
        <div className="navbar fixed z-100 bg-base-200 shadow-sm">
            <div className="flex-none">
                <button onClick={trocarDrawer} className="btn btn-square btn-ghost">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block h-5 w-5 stroke-current"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path> </svg>
                </button>
            </div>
            <div className="flex-1">
                <a className="btn btn-ghost text-xl"><h3 className="text-3xl">IFMS Eventos <span className="text-sm">v: 2.0</span></h3></a>
            </div>
            <div className="flex-none">
                <button onClick={() => _handleLogout()} className="btn btn-square btn-ghost mr-3">

                    {/* {!usuario ? <ion-icon style={{ fontSize: 24 }} className="w-3xl" name="person-add-outline"></ion-icon> : <ion-icon style={{ fontSize: 24 }} className="w-3xl" name="log-out-outline"></ion-icon>} */}
                    {!usuario ? <PiUserCircleDashedDuotone style={{ fontSize: 24 }} className="w-3xl"></PiUserCircleDashedDuotone> : <PiUserCircleCheckDuotone style={{ fontSize: 24 }} className="w-3xl" ></PiUserCircleCheckDuotone>}
                </button>
            </div>
        </div>
    )
}