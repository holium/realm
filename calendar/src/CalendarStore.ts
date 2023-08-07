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
}));

export default useCalendarStore;
