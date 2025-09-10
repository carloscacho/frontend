import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:4000/",
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
})

export default API;