import { powerMonitor, app, BrowserWindow } from 'electron';

export const registerListeners = (mainWindow: BrowserWindow) => {
  app.on('ready', () => {
    powerMonitor.on('suspend', () => {
      console.log('The system is going to sleep');
    });
    powerMonitor.on('resume', () => {
      console.log('The system is resuming');
    });
    // powerMonitor.on('on-ac', () => {
    //   console.log('The system is on AC Power (charging)');
    // });
    // powerMonitor.on('on-battery', () => {
    //   console.log('The system is on Battery Power');
    // });
    // powerMonitor.on('shutdown', () => {
    //   console.log('The system is Shutting Down');
    // });
    // powerMonitor.on('lock-screen', () => {
    //   console.log('The system is about to be locked');
    // });
    // powerMonitor.on('unlock-screen', () => {
    //   console.log('The system is unlocked');
    // });
    // const state = powerMonitor.getSystemIdleState(4);
    // console.log('Current System State - ', state);
    // const idle = powerMonitor.getSystemIdleTime();
    // console.log('Current System Idle Time - ', idle);
  });
};

export default { registerListeners };
