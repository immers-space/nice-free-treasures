import React, { useState, useEffect, useCallback } from "react";
import SimpleBar from "simplebar-react";
import "simplebar/dist/simplebar.min.css";
import cx from "classnames";

export function IntroPanel() {
  return (
    <div className="selector">
      <SimpleBar className="simpleBar" style={{ height: "100%" }}>
        <h2>What is an NFT?</h2>
        <p>
          NFT stands for "Nice, free treasures!" and it's a celebration of post-scarcity in the online realm. Once a
          work of digital art has been created (and the artist duly compensated for their labor), it can be reproduced
          infinitely at negligible cost.
        </p>
        {/* <p>⚠️Beware of scams: some people are attempting to charge money for NFTs but they are FREE treasures⚠️</p> */}
        <p>Click the treasure chest to open your free treasure.</p>
      </SimpleBar>
    </div>
  );
}
