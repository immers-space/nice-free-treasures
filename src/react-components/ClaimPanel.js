import React, { useState, useEffect, useCallback } from "react";
import "simplebar/dist/simplebar.min.css";
import { ModalWCInfo } from "./ModalWCInfo";
import { immersClient } from "../utils/immers";
import cx from "classnames";
import { ModalImmersInfo } from "./ModalImmersInfo";
import { ModalCheckResult } from "./ModalCheckResult";
import { Button, Spinner, Form } from "react-bootstrap";
import { useStore } from "../store";

export function ClaimPanel({ onClaimAvatar, claimStatus, compat, setCompat }) {
  const [step, setStep] = useState(0);
  const [userName, setUserName] = useState("");
  const [immer, setImmer] = useState("");
  // const [profile, setProfile] = useState({});
  const [errorState, setErrorState] = useState("");
  const [showCheckResult, setShowCheckResult] = useState(false);
  const [checking, setChecking] = useState(false);

  const setPaused = useStore(useCallback((state) => state.setPaused));
  const setShouldRenderSelfie = useStore(useCallback((state) => state.setShouldRenderSelfie));
  const profile = useStore(useCallback((state) => state.profile));
  const setProfile = useStore(useCallback((state) => state.setProfile));

  useEffect(() => {
    setUserName("will");
    setImmer("localhost:8081");
  }, []);

  useEffect(() => {
    if (compat && step === 0) {
      setShowCheckResult(true);
    }
  }, [compat, step]);
  useEffect(() => {
    if (step === 1) {
      document.body.classList.add("selfieFrame");
    } else {
      document.body.classList.remove("selfieFrame");
    }
  }, [step]);
  async function handleCheck() {
    setChecking(true);
    try {
      new URL(`https://${immer}/`);
    } catch (err) {
      setErrorState("domain");
      setChecking(false);
      return;
    }
    const handle = `${userName}[${immer}]`;
    const info = await immersClient.getNodeInfo(handle);
    if (!info || !info.protocols?.includes("activitypub")) {
      setCompat("fallback");
      setChecking(false);
      setProfile({ handle, displayName: userName, homeImmer: immer.toLowerCase() });
      return;
    }
    const profile = await immersClient.getProfile(handle);
    if (!profile) {
      setCompat("fallback");
      setChecking(false);
      setProfile({ handle, displayName: userName, homeImmer: immer });
      return;
    }
    setProfile(profile);
    if (info.metadata && info.metadata.WebCollectibles) {
      setCompat("WebCollectibles");
    } else {
      setCompat("ActivityPub");
    }
    setChecking(false);
  }
  const handleCheckResponse = (proceed) => {
    setShowCheckResult(false);
    if (proceed) {
      setStep(1);
    } else {
      setCompat("");
    }
  };

  const handleSnap = useCallback(() => {
    document.body.classList.add("selfieFlash");
    setPaused(true);
    setShouldRenderSelfie(true);
    setStep(2);
  }, [setPaused]);

  return (
    <div className="selector">
      <p>
        Nice free treasure! Now we'll create a <ModalWCInfo>WebCollectible</ModalWCInfo> to show that it's yours.
      </p>
      <ol>
        <li className={cx({ faded: step !== 0 })}>
          Who is claming the avatar?{" "}
          {step <= 0 ? (
            <Form>
              <Form.Group controlId="immers-handle.username">
                <Form.Label className="mb-0">Username</Form.Label>
                <Form.Control
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  inputMode="email"
                  name="username"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck="false"
                />
              </Form.Group>
              <Form.Group controlId="immers-handle.immer">
                <Form.Label className="mb-0">
                  <ModalImmersInfo>Immer</ModalImmersInfo> or Website domain
                </Form.Label>
                <Form.Control
                  type="text"
                  value={immer}
                  onChange={(e) => setImmer(e.target.value)}
                  inputMode="url"
                  name="immer"
                  placeholder="your-immer.com"
                  required
                  pattern="localhost(:\d+)?|.+\..+"
                  title="Valid domain name, including ."
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck="false"
                />
              </Form.Group>
              <Button variant="primary" onClick={handleCheck} disabled={checking}>
                Check {checking && <Spinner animation="border" size="sm" />}
              </Button>
            </Form>
          ) : (
            <span className="handle">
              {userName}[{immer}]
            </span>
          )}
        </li>
        <li className={cx({ faded: step !== 1 })}>
          Pose for your selfie
          {step == 1 && (
            <div>
              <div>
                Get that perfect pose: Drag to orient, scroll/pinch to zoom, and right-click/two-finger drag to
                position.
              </div>
              <Button onClick={handleSnap}>Snap</Button>
            </div>
          )}
        </li>
        <li className={cx({ faded: step !== 2 })}>
          Get your nice free treasure!
          {step === 2 && (
            <div>
              <div>Click the button to claim your WebCollectible.</div>
              <Button onClick={onClaimAvatar} disabled={claimStatus}>
                Claim {claimStatus === "processing" && <Spinner animation="border" size="sm" />}
              </Button>
            </div>
          )}
        </li>
      </ol>
      <ModalCheckResult show={showCheckResult} compat={compat} handleResponse={handleCheckResponse} profile={profile} />
    </div>
  );
}
