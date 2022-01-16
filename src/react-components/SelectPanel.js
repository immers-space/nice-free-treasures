import React, { useState, useEffect, useCallback } from "react";
import cx from "classnames";
import { Collapsible } from "./Collapsible";


export function SelectPanel({ claimHeading, claimPanel, editHeading, editPanel, showClaim }) {
  return (
    <div className="panel-selector">
      <div className={cx("panel", { collapsed: !showClaim })}>
        { claimHeading }
        <Collapsible>
          { claimPanel }
        </Collapsible>
      </div>
      <div className={cx("panel", { collapsed: showClaim })}>
        { editHeading }
        <Collapsible>
          { editPanel }
        </Collapsible>
      </div>
    </div>
  );
}
