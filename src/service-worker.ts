// src/firebase-messaging-sw.ts

interface NotificationData {
    id?: number;
    title: string;
    target_url: string;
    description?: string;
    images?: { jpg?: string };
    badge: string;
    locale: string;
}

declare const self: ServiceWorkerGlobalScope;

// =======================
// === Tracking Utils ====
// =======================

const postToEndpoint = async (url: string) => {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
};

const trackClick = (id: number) => postToEndpoint(`https://api.traffix.pro/public/announcements/${id}/click`);
const trackImpression = (id: number) => postToEndpoint(`https://api.traffix.pro/public/announcements/${id}/impression`);

// =======================
// === Notification API ==
// =======================

const fetchNotification = async (): Promise<NotificationData | null> => {
    try {
        const response = await fetch('https://api.traffix.pro/public/web-push/notification');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const json = await response.json();
        return json?.data?.data ?? null;
    } catch (error) {
        console.error('Ошибка при получении уведомления:', error);
        return null;
    }
};

// ==========================
// === Push Event Handler ===
// ==========================

self.addEventListener('push', async () => {
    try {
        await new Promise((r) => setTimeout(r, Math.random() * 5000));

        const data = await fetchNotification();
        if (!data || !data.title || !data.target_url) {
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
                url: data.target_url,
            },
        });

        if (data.id) {
            void trackImpression(data.id).catch((err) => console.error('Ошибка трекинга показа:', err));
        }
    } catch (err) {
        console.error('Ошибка в push-обработчике:', err);
    }
});

// ===========================
// === Install & Activate ====
// ===========================

self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// ==============================
// === Notification Click =======
// ==============================

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const { id, url } = event.notification.data || {};

    if (id) {
        void trackClick(id).catch((err) => console.error('Ошибка трекинга клика:', err));
    }

    if (url) {
        event.waitUntil(
            self.clients.openWindow(url).catch((err) =>
                console.error('Ошибка при открытии URL:', err)
            )
        );
    }
});
