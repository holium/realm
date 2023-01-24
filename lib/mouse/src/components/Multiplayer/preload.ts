import * as React from 'react';
import ReactDOM from 'react-dom/client';
import { contextBridge } from 'electron';
import { Presences } from './Presences';
import { api } from './multiplayer';
import { Mouse } from '../Mouse';

contextBridge.exposeInMainWorld('realmMultiplayer', api);

// Passing an instance or React and ReactDOM for the preload
export { React, ReactDOM, Presences, Mouse };
