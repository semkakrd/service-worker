import ky from "ky";

export const useApi = () => {
    return ky.create({
        prefixUrl: `https://api.traffix.pro/public`,
        headers: {
            'Content-Type': 'application/json',
        },
        timeout: 30000,
        retry: 10
    })
}