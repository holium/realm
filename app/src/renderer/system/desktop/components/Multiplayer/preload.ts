import * as React from 'react';
// @ts-expect-error
import ReactDOM from 'react-dom/client';
import { Presences } from './Presences';
import { api } from './multiplayer';
import { contextBridge } from 'electron';
import Mouse from '../Mouse';

contextBridge.exposeInMainWorld('realmMultiplayer', api);

// Passing an instance or React and ReactDOM for the preload
export { React, ReactDOM, Presences, Mouse };
