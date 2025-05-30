import {initializeApp} from "firebase/app";
import {getMessaging, onBackgroundMessage} from "firebase/messaging/sw";
import {useRepository} from "./useRepository.ts";

declare const self: ServiceWorkerGlobalScope;

const firebaseApp = initializeApp({
    apiKey: 'AIzaSyBvEJNAuJK3GIA-2ninOXhIQMlLpidVGSQ',
    authDomain: 'api-project-586854317896.firebaseapp.com',
    databaseURL: 'https://api-project-586854317896.firebaseio.com',
    projectId: 'api-project-586854317896',
    storageBucket: 'api-project-586854317896.appspot.com',
    messagingSenderId: '586854317896',
    appId: '1:586854317896:web:bc3ae45a1417a2df5bfd7d',
    measurementId: 'G-T6GE7129SW',
});
const {trackClick, trackImpression, getNotification} = useRepository()
const messaging = getMessaging(firebaseApp);
type Data = {
    id: number;
    url: string
}
onBackgroundMessage(messaging, async () => {
    try {
        await new Promise((r) => setTimeout(r, Math.random() * 5000));

        const {data} = await getNotification();
        if (!data || !data.title || !data.target_url || !data.id) {
            console.warn('Неверные или отсутствующие данные уведомления:', data);
            return;
        }

        await self.registration.showNotification(data.title, {
            body: data.description ?? '',
            icon: data.images?.jpg,
            // @ts-ignore
            image: data.images?.jpg ?? '',
            vibrate: [200, 100, 200],
            badge: data.badge,
            requireInteraction: true,
            data: {
                id: data.id,
                url: data.target_url
            } as Data,
        });

        void trackImpression(data.id);
    } catch (err) {
        console.error('Ошибка в push-обработчике:', err);
    }
})

self.addEventListener('install', (event) => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const {id, url} = event.notification.data as Data

    if (id) {
        void trackClick(id)
    }

    if (url) {
        event.waitUntil(self.clients.openWindow(url));
    }
});