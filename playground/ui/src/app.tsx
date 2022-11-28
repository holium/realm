import React, { FC, useState } from 'react';
import { observer } from 'mobx-react-lite';
import * as RealmMultiplayer from '@holium/realm-multiplayer';
import {
  useShips,
  useChannel,
  BaseRealmPayload,
} from '@holium/realm-multiplayer';
import { Editor } from './components/Editor';

interface IProps {
  history?: History;
}

export const App: FC<IProps> = observer(() => (
  <RealmMultiplayer.Provider channel="/test">
    <AppInProvider />
  </RealmMultiplayer.Provider>
));

interface TestPayload extends BaseRealmPayload {
  event: 'test';
  hello: string;
}
let testCt = 0;

function AppInProvider() {
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);
  const [hover, setIsHover] = useState(false);
  const [down, setIsDown] = useState(false);
  const [testResult, setTestResult] = useState('');
  const send = useChannel<TestPayload>('test', (payload) => {
    setTestResult(
      'useChannel test success #' +
        testCt++ +
        '' +
        JSON.stringify(payload, null, 2)
    );
  });
  return (
    <div>
      <h1>Multiplayer Cursor Playground</h1>
      <ShipList />
      <main>
        <ul style={{ display: 'grid', gap: '10px' }}>
          <li>
            <Editor id="editor-0" />
          </li>
          <li>
            <RealmMultiplayer.Clickable
              id="button-test"
              onClick={() => setCount1((c) => c + 1)}
            >
              <button onClick={() => send({ event: 'test', hello: '123' })}>
                Send test useChannel payload
              </button>
            </RealmMultiplayer.Clickable>
            <br />
            <pre>{testResult}</pre>
          </li>
          <li>
            <RealmMultiplayer.Clickable
              id="button-0"
              onClick={() => setCount1((c) => c + 1)}
            >
              This is just some text using Clickable default button
            </RealmMultiplayer.Clickable>
            <br />
            It's been clicked {count1} times!
            <pre>
              {`<RealmMultiplayer.Clickable
  id="button-0"
  onClick={() => setCount1((c) => c + 1)}
>
  This is just some text using Clickable default button
</RealmMultiplayer.Clickable>`}
            </pre>
          </li>
          <li>
            <RealmMultiplayer.Clickable
              id="button-2"
              onOtherClick={(patp) => {
                console.log('someone clicked', patp);
              }}
              onOtherOver={(patp) => {
                console.log('someone over', patp);
                setIsHover(true);
              }}
              onMouseOver={() => setIsHover(true)}
              onOtherOut={(patp) => {
                console.log('someone out', patp);
                setIsHover(false);
              }}
              onMouseOut={() => setIsHover(false)}
              onOtherUp={(patp) => {
                console.log('someone up', patp);
                setIsDown(false);
              }}
              onMouseUp={() => setIsDown(false)}
              onMouseDown={() => setIsDown(true)}
              onOtherDown={(patp) => {
                setIsDown(true);
                console.log('someone down', patp);
              }}
              onClick={() => setCount2((c) => c + 1)}
            >
              <a
                href="#"
                style={{
                  display: 'inline-block',
                  color: hover ? 'red' : 'black',
                  boxShadow: hover ? '0 0 10px red' : 'none',
                  transform: down ? 'scale(0.9)' : 'none',
                  transition: 'transform 0.2s',
                }}
              >
                This is a link wrapped by Clickable with a multiplayer hover
                state
              </a>
            </RealmMultiplayer.Clickable>
            <br />
            It's been clicked {count2} times!
            <pre>
              {`<RealmMultiplayer.Clickable
  id="button-2"
  onClick={() => setCount2((c) => c + 1)}
>
  <a href="#">This is a link wrapped by Clickable</a>
</RealmMultiplayer.Clickable>`}
            </pre>
          </li>
          <li>
            <details>
              <RealmMultiplayer.Clickable
                id="details-1"
                onClick={() => setCount2((c) => c + 1)}
              >
                <summary>Click to expand</summary>
              </RealmMultiplayer.Clickable>
              Hello!
            </details>
          </li>
        </ul>
      </main>
    </div>
  );
}

function ShipList() {
  const ships = useShips();
  return (
    <aside>
      <ul>
        Ships online:
        {Object.entries(ships).map(([id, ship]) => (
          <li key={id}>{ship.patp}</li>
        ))}
      </ul>
    </aside>
  );
}
