import React, { useState, useEffect, useCallback } from "react";
import SimpleBar from "simplebar-react";
import "simplebar/dist/simplebar.min.css";
import { immersClient } from "../utils/immers";
import cx from "classnames";

export function ClaimPanel({ onClaimAvatar }) {
  const [step, setStep] = useState("check");
  const [compat, setCompat] = useState("");
  const [userName, setUserName] = useState("");
  const [immer, setImmer] = useState("");
  const [profile, setProfile] = useState({});
  const [errorState, setErrorState] = useState("");
  async function handleCheck() {
    try {
      new URL(`https://${immer}/`);
    } catch (err) {
      setErrorState("domain");
      return;
    }
    const handle = `${userName}[${immer}]`;
    const info = await immersClient.getNodeInfo(handle);
    if (!info) {
      setCompat("fallback");
      return;
    }
    if (!info.protocols.includes("activitypub")) {
      setCompat("fallback");
      return;
    }
    const profile = await immersClient.getProfile(handle);
    if (!profile) {
      setCompat("fallback");
      return;
    }
    setProfile(profile);
    if (info.metadata && info.metadata.WebCollectibles) {
      setCompat("WebCollectibles");
    } else {
      setCompat("ActivityPub");
    }
  }
  return (
    <div className="selector">
      <SimpleBar className="simpleBar" style={{ height: "100%" }}>
        <p>
          Nice free treasure! Now we'll create a WebCollectible to show that it's yours. WebCollectibles use{" "}
          <a href="https://activitypub.rocks/" target="_blank">
            ActivityPub
          </a>
          , a non-blockhain federated ledger that doesn't need wasteful consensus work and allows anyone to partipiate
          without requiring permission or expensive equipment.
        </p>
        <ol>
          <li>
            Who is claming the avatar?
            <div>
              <label>
                Username
                <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} />
              </label>
              <label>
                Immer{" "}
                <a href="https://web.immers.space/what-is-immers-space" target="_blank">
                  ❔
                </a>{" "}
                or Website domain
                <input type="text" value={immer} onChange={(e) => setImmer(e.target.value)} />
              </label>
              <button onClick={handleCheck}>Check</button>
              {compat === "fallback" && (
                <p>
                  Your provider doesn't apear to support open Web standards. We can still create your collectible, but
                  you'll just have to right-click-save it.
                </p>
              )}
              {compat === "ActivityPub" && (
                <p>
                  Hi, {profile.displayName}! Your provider supports open Web standards, but not WebCollectibles. We'll
                  create your collectible and share it to your timeline.
                </p>
              )}
              {compat === "WebCollectibles" && (
                <p>
                  Hi, {profile.displayName}! Your provider supports WebCollectibles. You can add this directly to your
                  collections.
                </p>
              )}
            </div>
          </li>
          <li></li>
        </ol>
        <p>Step: {step}</p>
        <button onClick={onClaimAvatar} className="primary">
          Claim avatar
        </button>
      </SimpleBar>
    </div>
  );
}
