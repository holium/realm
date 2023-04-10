type MaintenanceWindow = {
  weekDay: string;
  startTime: string;
  endTime: string;
};

export const maintenanceWindows: MaintenanceWindow[] = [
  {
    weekDay: 'Monday',
    startTime: '01:00',
    endTime: '03:00',
  },
  {
    weekDay: 'Tuesday',
    startTime: '01:00',
    endTime: '03:00',
  },
  {
    weekDay: 'Wednesday',
    startTime: '01:00',
    endTime: '03:00',
  },
  {
    weekDay: 'Thursday',
    startTime: '01:00',
    endTime: '03:00',
  },
  {
    weekDay: 'Friday',
    startTime: '01:00',
    endTime: '03:00',
  },
  {
    weekDay: 'Saturday',
    startTime: '01:00',
    endTime: '03:00',
  },
  {
    weekDay: 'Sunday',
    startTime: '01:00',
    endTime: '03:00',
  },
  {
    weekDay: 'Sunday',
    startTime: '04:00',
    endTime: '06:00',
  },
];

export const maintenanceWindowToString = ({
  weekDay,
  startTime,
  endTime,
}: MaintenanceWindow) => `${weekDay} ${startTime} - ${endTime} GMT`;
