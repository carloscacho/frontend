export const getEventImageUrl = (evento) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4455"
    if (!evento || !evento.banner) {
        return "https://placehold.co/400x200?text=Evento"
    }
    return `${baseUrl}${evento.banner.startsWith('/') ? '' : '/'}${evento.banner}`
}
