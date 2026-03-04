export default function EventBanner({ evento }) {

    return (
        <div className="w-full relative">
            <img
                src={evento.banner ? `http://localhost:4455${evento.banner.startsWith('/') ? '' : '/'}${evento.banner}` : "https://placehold.co/1920x400?text=Banner+Evento"}
                alt={evento.nome}
                className="w-full h-auto object-contain"
            />
            {!evento.banner && (
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-white text-center px-4">{evento.nome}</h1>
                </div>
            )}
        </div>
    );
}
