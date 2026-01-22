import { api } from "./api.ts";
import { NotificationModel } from "./types/notification.model.ts";
import { Response } from "./types/response.ts";
export const useRepository = () => ({
  getNotification: () =>
    api.get("web-push/notification").json<Response<NotificationModel>>(),
  trackClick: (id: number) => api.post(`announcements/${id}/click`).json(),
  trackImpression: (id: number) =>
    api.post(`announcements/${id}/impression`).json(),
});
