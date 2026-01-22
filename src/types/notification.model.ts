import { Language } from "./language.type"

export interface NotificationModel {
    id: number,
    title: string
    description?: string | null,
    image: string,
    target_url: string,
    locale: Language
    badge: string,
    vibrate?: number[],
    renotify?: boolean,
    tag?: string | number
    dir?: 'auto'
}