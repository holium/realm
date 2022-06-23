import React, { FC, useEffect, useState } from "react";
import { useLocation, useNavigate, Outlet, Link } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useStore } from "./logic/store";

type IProps = {
  history?: History;
};

export const App: FC<IProps> = observer((props: IProps) => {
  const location = useLocation();
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>Multiplayer Cursor Playground</h1>
      <main>
        <ul>
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
  );
});
