import React, { useState, useEffect, useCallback } from "react";
import SimpleBar from "simplebar-react";
import "simplebar/dist/simplebar.min.css";
import cx from "classnames";


export function ClaimPanel({ onClaimAvatar }) {
  return (
    <div className="selector">
      <SimpleBar className="simpleBar" style={{ height: "100%" }}>
      <button onClick={onClaimAvatar} className="primary">
        Claim avatar
      </button>
      </SimpleBar>
    </div>
  );
}
