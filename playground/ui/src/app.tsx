import React, { FC, useEffect, useState } from "react";
import { useLocation, useNavigate, Outlet, Link } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useStore } from "./logic/store";
import * as RealmMultiplayer from "./lib/realm-multiplayer";
import { useShips, useChannel } from "./lib/realm-multiplayer";
import { BaseRealmPayload } from "../../../app/src/renderer/system/desktop/components/Multiplayer/types";

type IProps = {
  history?: History;
};

export const App: FC<IProps> = observer((props: IProps) => {
  const location = useLocation();

  return (
    <RealmMultiplayer.Provider channel="/test">
      <AppInProvider />
    </RealmMultiplayer.Provider>
  );
});

interface TestPayload extends BaseRealmPayload {
  event: "test";
  hello: string;
}
let testCt = 0;

function AppInProvider() {
  const [count, setCount] = useState(0);
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);
  const [testResult, setTestResult] = useState("");
  const send = useChannel<TestPayload>("test", (payload) => {
    setTestResult(
      "useChannel test success #" +
        testCt++ +
        "" +
        JSON.stringify(payload, null, 2)
    );
  });
  return (
    <div>
      <h1>Multiplayer Cursor Playground</h1>
      <ShipList />
      <main>
        <ul style={{ display: "grid", gap: "10px" }}>
          <li>
            <button
              data-multi-click-id={"button-test"}
              onClick={() => send({ event: "test", hello: "123" })}
            >
              Send test useChannel payload
            </button>
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
              onClick={() => setCount2((c) => c + 1)}
            >
              <a href="#">This is a link wrapped by Clickable</a>
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
            <button
              data-multi-click-id={"button-1"}
              onClick={() => setCount((c) => c + 1)}
            >
              This is a button
            </button>
            <br />
            It's been clicked {count} times!
            <pre>
              {`<button
  data-multi-click-id={"button-1"}
  onClick={() => setCount((c) => c + 1)}
>
  This is a button
</button>`}
            </pre>
          </li>
          <li>
            <details>
              <summary data-multi-click-id={"details-1"}>
                Click to expand
              </summary>
              Hello!
            </details>
          </li>

          <li>
            <select data-multi-click-id={"select-1"}>
              <option>Test</option>
              <option>Test 2</option>
              <option>Test 3</option>
            </select>
            <br />
            Because select is an os level primitive multiclick doesn't work
            well, but if you do a custom select implementation like radix, it
            should be fine
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
