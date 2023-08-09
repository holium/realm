import create from 'zustand';

export interface CalendarStore {
  space: string;
  setSpace: (space: string) => void;

  isEditingInstance: boolean;
  setIsEditingInstance: (value: boolean) => void;

  editingData: any;
  setEditingData: (data: any) => void;

  currentCalendarSub: null | number;
  setCurrentCalendarSub: (subNumber: null | number) => void;

  spans: any;
  setSpans: (spans: any) => void;

  calendarList: any;
  setCalendarList: (calendarList: any) => void;

  selectedCalendar: null | string;
  setSelectedCalendar: (selectedCalendar: string) => void;

  publicCalendarId: null | string;
  setPublicCalendarId: (publicCalendarId: null | string) => void;
}

const useCalendarStore = create<CalendarStore>((set) => ({
  space: '',
  setSpace: (space: string) => {
    set(() => ({ space }));
  },

  isEditingInstance: false,
  setIsEditingInstance: (value: boolean) => {
    set(() => ({ isEditingInstance: value }));
  },

  editingData: null,
  setEditingData: (data: any) => {
    set(() => ({ editingData: data }));
  },

  currentCalendarSub: null,
  setCurrentCalendarSub: (subNumber: null | number) => {
    set(() => ({ currentCalendarSub: subNumber }));
  },

  spans: [],
  setSpans: (spans: any) => {
    set(() => ({ spans }));
  },

  calendarList: [],
  setCalendarList: (calendarList: any) => {
    set(() => ({ calendarList }));
  },

  selectedCalendar: null,
  setSelectedCalendar: (selectedCalendar: null | string) => {
    set(() => ({ selectedCalendar }));
  },

  publicCalendarId: null,
  setPublicCalendarId: (publicCalendarId: null | string) => {
    set(() => ({ publicCalendarId }));
  },
}));

export default useCalendarStore;
