import React, { FC, useEffect, useState } from "react";
import { useLocation, useNavigate, Outlet, Link } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useStore } from "./logic/store";

type IProps = {
  history?: History;
};

export const App: FC<IProps> = observer((props: IProps) => {
  const location = useLocation();

  return (
    <div>
      <div>Playground - </div>
    </div>
  );
});
