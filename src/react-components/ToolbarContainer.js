import React from "react";
import { Toolbar } from "./Toolbar";
import { UploadButton } from "./UploadButton";
import { MoreMenu } from "./MoreMenu";
import { dispatch } from "../dispatch";
import constants from "../constants";

function dispatchResetView() {
  dispatch(constants.resetView);
}

export function ToolbarContainer({ onGLBUploaded, randomizeConfig }) {
  return (
    <Toolbar>
      <span className="appName">Nice Free Treasures Shop</span>
      <MoreMenu
        items={
          <>
            <UploadButton onGLBUploaded={onGLBUploaded} />
            <a href="https://github.com/immers-space/nice-free-treasures" target="_blank">
              GitHub
            </a>
          </>
        }
      ></MoreMenu>
      <button onClick={randomizeConfig}>Randomize avatar</button>
      <button onClick={dispatchResetView}>Reset camera view</button>
    </Toolbar>
  );
}
