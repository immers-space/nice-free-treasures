import React from "react";

export function AvatarEditor({ thumbnailMode, leftPanel, rightPanel, buttonTip, toolbar, modal }) {
  return (
    <>
      <div className="main">
        {!thumbnailMode && leftPanel}
        {rightPanel}
        {buttonTip}
        {modal}
      </div>
      {!thumbnailMode && toolbar}
    </>
  );
}
