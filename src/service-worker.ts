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
        const {data} = await getNotification();
        if (!data || !data.title || !data.target_url || !data.id) {
            return;
        }

        await self.registration.showNotification(data.title, {
            body: data.description,
            icon: data.images.jpg,
            // @ts-ignore
            image: data.images.jpg,
            badge: data.badge,
            requireInteraction: true,
            tag: data.tag.toString() || undefined,
            renotify: data.renotify,
            dir: data.dir,
            lang: data.locale,
            vibrate: data.vibrate,
            data: {
                id: data.id,
                url: data.target_url
            } as Data,
        });

        await trackImpression(data.id);
    } catch (err) {
        console.error('Ошибка в push-обработчике:', err);
    }
})

self.addEventListener('install', (event) => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const {id, url} = event.notification.data;

    event.waitUntil(
        Promise.all([
            id ? trackClick(id) : Promise.resolve(),
            self.clients.matchAll({
                type: 'window',
                includeUncontrolled: true
            }).then(function(clientList) {
                for (const client of clientList) {
                    if (client.url === url && 'focus' in client) {
                        return client.focus();
                    }
                }

                return self.clients.openWindow(url);
            })
        ])
    );
});