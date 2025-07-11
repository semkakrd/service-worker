import {useApi} from "./useApi.ts";

export const useRepository = () => ({
    getNotification: () => useApi().get<{
        data: {
            id: number;
            title: string;
            target_url: string;
            description?: string;
            images: { jpg: string };
            badge: string;
            locale: string;
            vibrate: Array<number>;
            renotify: boolean;
            tag?: number
            dir: 'auto' | 'ltr' | 'rtl';
        }
    }>('web-push/notification').json(),
    trackClick: (id: number) => useApi().post(`announcements/${id}/click`).json(),
    trackImpression: (id: number) => useApi().post(`announcements/${id}/impression`).json()
});