import React from "react";
import { Toolbar } from "./Toolbar";
// import { UploadButton } from "./UploadButton";
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
            <button onClick={dispatchResetView}>Reset camera view</button>
            {/* <UploadButton onGLBUploaded={onGLBUploaded} /> */}
            <p>
              Created by{" "}
              <a href="https://web.immers.space" target="_blank">
                Immers Space
              </a>
            </p>
            <p>
              Join our{" "}
              <a href="https://eepurl.com/hhhvE1" target="_blank" rel="nofollow">
                mailing list
              </a>
            </p>
            <p>
              <a href="https://github.com/immers-space/nice-free-treasures" target="_blank">
                Source code
              </a>
            </p>
            <p className="attribution">
              <a href="https://skfb.ly/6TwqF" target="_blank">
                "Low poly treasure chest"
              </a>{" "}
              by cattleya is licensed under{" "}
              <a href="http://creativecommons.org/licenses/by/4.0/" target="_blank">
                Creative Commons Attribution.
              </a>
            </p>
          </>
        }
      ></MoreMenu>
    </Toolbar>
  );
}
