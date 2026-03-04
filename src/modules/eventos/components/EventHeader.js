export default function EventHeader({ evento }) {
    if (!evento) return null;

    return (
        <div className="pt-8 pb-4 text-center">
            <h1 className="text-3xl font-bold uppercase text-primary mb-2">
                {evento.nome}
            </h1>
            <p className="text-lg">Faça login para se inscrever no evento</p>
        </div>
    );
}
