import { create } from "axios";

export const axios = create({
    baseURL: "http://localhost:5000",
    headers: {
    'Content-Type': 'application/json',
    },
    withCredentials: true,
});

export default axios