import Image from "next/image";

export default function Header(props) {
  return(
    <div class="navbar bg-base-100 shadow-sm">
  <div class="navbar-start">
    <div class="dropdown">
      <a onClick={() => props.setDrawer(!props.drawer)} tabindex="0" role="button" class="btn btn-ghost btn-circle">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" /> </svg>
      </a>
    </div>
  </div>
  <div class="navbar-center">
      <Image className="w-40" src={require('@/assets/ifms-marca-2015.png')} />
  </div>
  <div class="navbar-end">
    <button class="btn btn-ghost btn-circle">
      <div class="indicator">
        <ion-icon className="w-3xl" name="person-outline"></ion-icon>
      </div>
    </button>
  </div>
</div>
  )
}