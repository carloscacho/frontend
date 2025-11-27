import Image from "next/image";
import { PiUser } from "react-icons/pi";

export default function Header(props) {
  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="navbar-start">
        <div className="dropdown">
          <a onClick={() => props.setDrawer(!props.drawer)} tabIndex="0" role="button" className="btn btn-ghost btn-circle">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /> </svg>
          </a>
        </div>
      </div>
      <div className="navbar-center">
        <Image className="w-40" src={require('@/assets/ifms-marca-2015.png')} />
      </div>
      <div className="navbar-end">
        <button className="btn btn-ghost btn-circle">
          <div className="indicator">
            <PiUser size={24} />
          </div>
        </button>
      </div>
    </div>
  )
}