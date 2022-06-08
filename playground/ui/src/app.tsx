import React, { FC, useEffect, useState } from "react";
import { useLocation, useNavigate, Outlet, Link } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useStore } from "./logic/store";
import { RealmMultiplayerProvider } from "./lib/realm-multiplayer";
import { Clickable } from "./lib/realm-multiplayer/Clickable";

type IProps = {
  history?: History;
};

export const App: FC<IProps> = observer((props: IProps) => {
  const location = useLocation();
  const [count, setCount] = useState(0);
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);

  return (
    <RealmMultiplayerProvider channel="/test">
      <div>
        <h1>Multiplayer Cursor Playground</h1>
        <main>
          <ul>
            <li>
              <Clickable id="button-0" onClick={() => setCount1((c) => c + 1)}>
                This is Clickable wrapped
              </Clickable>
              <br />
              It's been clicked {count1} times!
            </li>
            <li>
              <Clickable id="button-2" onClick={() => setCount2((c) => c + 1)}>
                <button>This is Clickable wrapped</button>
              </Clickable>
              <br />
              It's been clicked {count2} times!
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
            </li>
            <li>
              <details>
                <summary data-multi-click-id={"details-1"}>
                  Click to expand
                </summary>
                Hello!
              </details>
            </li>
          </ul>
        </main>
      </div>
    </RealmMultiplayerProvider>
  );
});
