import { create } from "zustand";

const useCalendarStore = create((set) => ({
    calendars: [],

    fetchCalendars: async () => {
        try {
          const res = await fetch('/api/calendars/search')
      
          if (res.status === 401) {
            window.location.href = '/login'
            // Сбрасываем календари, чтобы не показывать старые данные
            set({ calendars: [] })
            return
          }
          if (!res.ok) {
            throw new Error(`Ошибка ${res.status}: ${res.statusText}`)
          }
      
          const data = await res.json()
          set({ calendars: data })
        } catch (err) {
          console.error('fetchCalendars error:', err)
          // при ошибке тоже сбросим список
          set({ calendars: [] })
        }
      },

    addCalendar: async (name, type) => {
        const res = await fetch("/api/calendars/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, type }),
        });
        const newCalendar = await res.json();
        set((state) => ({ calendars: [...state.calendars, newCalendar] }));
    },
}));

export default useCalendarStore;
