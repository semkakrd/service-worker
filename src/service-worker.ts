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
// === IndexedDB Setup ===
// =======================

const DB_NAME = 'PushNotificationsDB';
const STORE_NAME = 'clickedNotifications';
const DB_VERSION = 1;

const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

const saveClickedNotification = async (id: number): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put({ id });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
        db.close();
    });
};

const getClickedNotifications = async (): Promise<number[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result.map((item) => item.id));
        request.onerror = () => reject(request.error);
        db.close();
    });
};

// =======================
// === Tracking Utils ====
// =======================

const postToEndpoint = async (url: string) => {
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
};

const trackClick = (id: number) => postToEndpoint(`https://api.traffix.pro/public/announcements/${id}/click`);
const trackImpression = (id: number) => postToEndpoint(`https://api.traffix.pro/public/announcements/${id}/impression`);

// =======================
// === Notification API ==
// =======================

const fetchNotification = async (excludeIds: number[]): Promise<NotificationData | null> => {
    try {
        const response = await fetch('https://api.traffix.pro/public/web-push/notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ exclude_ids: excludeIds }),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const json = await response.json();
        return json?.data ?? null;
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

        const excludeIds = await getClickedNotifications();
        const data = await fetchNotification(excludeIds);
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
            data: { id: data.id, url: data.target_url },
        });

        void trackImpression(data.id).catch((err) => console.error('Ошибка трекинга показа:', err));
    } catch (err) {
        console.error('Ошибка в push-обработчике:', err);
    }
});

// ===========================
// === Install & Activate ====
// ===========================

self.addEventListener('install', (event) => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

// ==============================
// === Notification Click =======
// ==============================

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const { id, url } = event.notification.data || {};

    if (id) {
        void saveClickedNotification(id).catch((err) => console.error('Ошибка сохранения клика:', err));
        void trackClick(id).catch((err) => console.error('Ошибка трекинга клика:', err));
    }

    if (url) {
        event.waitUntil(self.clients.openWindow(url).catch((err) => console.error('Ошибка открытия URL:', err)));
    }
});