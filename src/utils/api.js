import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:4455/",
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
})

API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            if (typeof window !== 'undefined') {
                // Remove cookies usando js-cookie se disponível, ou document.cookie como fallback
                // Como este arquivo é um utilitário, vamos assumir que o js-cookie pode não estar importado aqui.
                // Para garantir, vamos usar document.cookie para limpar.
                document.cookie = 'token=; Max-Age=0; path=/';
                document.cookie = 'usuario=; Max-Age=0; path=/';

                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default API;