import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";
import { useRepository } from "./repository.ts";
import { Language } from "./types/language.type.ts";

declare const self: ServiceWorkerGlobalScope;

interface Data {
  id: number;
  url: string;
};

const firebaseApp = initializeApp({
  apiKey: "AIzaSyBvEJNAuJK3GIA-2ninOXhIQMlLpidVGSQ",
  authDomain: "api-project-586854317896.firebaseapp.com",
  databaseURL: "https://api-project-586854317896.firebaseio.com",
  projectId: "api-project-586854317896",
  storageBucket: "api-project-586854317896.appspot.com",
  messagingSenderId: "586854317896",
  appId: "1:586854317896:web:bc3ae45a1417a2df5bfd7d",
  measurementId: "G-T6GE7129SW",
});
const { trackClick, trackImpression, getNotification } = useRepository();
const messaging = getMessaging(firebaseApp);
const actions: Record<
  Language,
  {
    close: string;
    open: string;
  }
> = {
  az: { close: "Bağla ❌", open: "Tam göstər 🔍" }, // Азербайджанский
  ar: { close: "إغلاق ❌", open: "عرض الكل 🔍" }, // Арабский
  en: { close: "Close ❌", open: "Show more 🔍" }, // Английский
  ru: { close: "Закрыть ❌", open: "Показать полностью 🔍" }, // Русский
  de: { close: "Schließen ❌", open: "Mehr anzeigen 🔍" }, // Немецкий
  fr: { close: "Fermer ❌", open: "Voir plus 🔍" }, // Французский
  es: { close: "Cerrar ❌", open: "Ver más 🔍" }, // Испанский
  it: { close: "Chiudi ❌", open: "Mostra di più 🔍" }, // Итальянский
  pt: { close: "Fechar ❌", open: "Ver mais 🔍" }, // Португальский
  be: { close: "Зачыніць ❌", open: "Паказаць цалкам 🔍" }, // Белорусский
  kz: { close: "Жабу ❌", open: "Толығымен көрсету 🔍" }, // Казахский
  pl: { close: "Zamknij ❌", open: "Pokaż więcej 🔍" }, // Польский
  uk: { close: "Закрити ❌", open: "Показати повністю 🔍" }, // Украинский
  cs: { close: "Zavřít ❌", open: "Zobrazit více 🔍" }, // Чешский
  bg: { close: "Затвори ❌", open: "Покажи повече 🔍" }, // Болгарский
  hr: { close: "Zatvori ❌", open: "Prikaži više 🔍" }, // Хорватский
  hu: { close: "Bezár ❌", open: "Többet mutat 🔍" }, // Венгерский
  ro: { close: "Închide ❌", open: "Arată mai mult 🔍" }, // Румынский
  sk: { close: "Zatvoriť ❌", open: "Zobraziť viac 🔍" }, // Словацкий
  sl: { close: "Zapri ❌", open: "Prikaži več 🔍" }, // Словенский
  sq: { close: "Mbyll ❌", open: "Shfaq më shumë 🔍" }, // Албанский
  hy: { close: "Փակել ❌", open: "Ցույց տալ ավելին 🔍" }, // Армянский
  bn: { close: "বন্ধ ❌", open: "আরও দেখান 🔍" }, // Бенгальский
  bs: { close: "Zatvori ❌", open: "Prikaži više 🔍" }, // Боснийский
  el: { close: "Κλείσιμο ❌", open: "Δείξε περισσότερα 🔍" }, // Греческий
  ka: { close: "დახურვა ❌", open: "მეტის ჩვენება 🔍" }, // Грузинский
  id: { close: "Tutup ❌", open: "Tampilkan lebih banyak 🔍" }, // Индонезийский
  kk: { close: "Жабу ❌", open: "Толығымен көрсету 🔍" }, // Казахский (альтернативный)
  ky: { close: "Жабуу ❌", open: "Толук көрсөтүү 🔍" }, // Киргизский
  km: { close: "បិទ ❌", open: "បង្ហាញបន្ថែម 🔍" }, // Кхмерский
  lv: { close: "Aizvērt ❌", open: "Rādīt vairāk 🔍" }, // Латышский
  lt: { close: "Uždaryti ❌", open: "Rodyti daugiau 🔍" }, // Литовский
  mk: { close: "Затвори ❌", open: "Покажи повеќе 🔍" }, // Македонский
  ms: { close: "Tutup ❌", open: "Tunjukkan lebih banyak 🔍" }, // Малайский
  nl: { close: "Sluiten ❌", open: "Toon meer 🔍" }, // Нидерландский
  sr: { close: "Затвори ❌", open: "Прикажи више 🔍" }, // Сербский
  th: { close: "ปิด ❌", open: "แสดงเพิ่มเติม 🔍" }, // Тайский
  tr: { close: "Kapat ❌", open: "Daha fazla göster 🔍" }, // Турецкий
  uz: { close: "Yopish ❌", open: "Ko‘proq ko‘rsatish 🔍" }, // Узбекский
  fi: { close: "Sulje ❌", open: "Näytä lisää 🔍" }, // Финский
  fil: { close: "Isara ❌", open: "Ipakita ang higit pa 🔍" }, // Филиппинский
  hi: { close: "बंद करें ❌", open: "और दिखाएं 🔍" }, // Хинди
  sv: { close: "Stäng ❌", open: "Visa mer 🔍" }, // Шведский
  et: { close: "Sulge ❌", open: "Näita rohkem 🔍" }, // Эстонский
  da: { close: "Luk ❌", open: "Vis mere 🔍" }, // Датский
};

onBackgroundMessage(messaging, async () => {
  try {
    const {
      title,
      target_url,
      locale,
      tag,
      badge,
      id,
      icon,
      description,
      renotify,
      dir,
      vibrate,
      image,
    } = (await getNotification()).data;
    if (!title || !target_url || !id) {
      return;
    }
    const options: NotificationOptions = {
      body: description || "",
      icon,
      // @ts-ignore
      image,
      badge,
      requireInteraction: true,
      tag: tag?.toString() || undefined,
      renotify,
      dir,
      lang: locale,
      vibrate,
      data: {
        id,
        url: target_url,
      } as Data,
    };

    if (locale in actions) {
      // @ts-ignore
      options.actions = [
        {
          action: "open",
          title: actions[locale].open,
        },
        {
          action: "close",
          title: actions[locale].close,
        },
      ];
    }

    await self.registration.showNotification(title, options);

    await trackImpression(id);
  } catch (err) {
    console.error("Ошибка в push-обработчике:", err);
  }
});

self.addEventListener("install", (event) =>
  event.waitUntil(self.skipWaiting()),
);

self.addEventListener("activate", (event) =>
  event.waitUntil(self.clients.claim()),
);

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const { id, url } : Data = event.notification.data;

  event.waitUntil(
    Promise.all([
      id ? trackClick(id) : Promise.resolve(),
      self.clients
        .matchAll({
          type: "window",
          includeUncontrolled: true,
        })
        .then((clientList) => {
          for (const client of clientList) {
            if (client.url === url && "focus" in client) {
              return client.focus();
            }
          }

          return self.clients.openWindow(url);
        }),
    ]),
  );
});
