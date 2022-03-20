import React, { useState, useEffect, useCallback } from "react";
import SimpleBar from "simplebar-react";
import "simplebar/dist/simplebar.min.css";
import { ModalWCInfo } from "./ModalWCInfo";
import { immersClient } from "../utils/immers";
import cx from "classnames";
import { ModalImmersInfo } from "./ModalImmersInfo";
import { ModalCheckResult } from "./ModalCheckResult";
import { Button, Spinner, Form } from "react-bootstrap";

export function ClaimPanel({ onClaimAvatar, handleScreenshot }) {
  const [step, setStep] = useState(0);
  const [compat, setCompat] = useState("");
  const [userName, setUserName] = useState("");
  const [immer, setImmer] = useState("");
  const [profile, setProfile] = useState({});
  const [errorState, setErrorState] = useState("");
  const [showCheckResult, setShowCheckResult] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    setUserName("will");
    setImmer("localhost:8081");
  }, []);

  useEffect(() => {
    if (compat && step === 0) {
      setShowCheckResult(true);
    }
  }, [compat, step]);
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
    if (!info) {
      setCompat("fallback");
      setChecking(false);
      return;
    }
    if (!info.protocols.includes("activitypub")) {
      setCompat("fallback");
      setChecking(false);
      return;
    }
    const profile = await immersClient.getProfile(handle);
    if (!profile) {
      setCompat("fallback");
      setChecking(false);
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
  return (
    <div className="selector">
      <SimpleBar className="simpleBar" style={{ height: "100%" }}>
        <p>
          Nice free treasure! Now we'll create a <ModalWCInfo>WebCollectible</ModalWCInfo> to show that it's yours.
        </p>
        <ol>
          <li className={cx({ faded: step !== 0 })}>
            Who is claming the avatar?
            {step <= 0 ? (
              <Form>
                <Form.Group controlId="immers-handle.username">
                  <Form.Label className="mb-0">Username</Form.Label>
                  <Form.Control type="text" value={userName} onChange={(e) => setUserName(e.target.value)} />
                </Form.Group>
                <Form.Group controlId="immers-handle.immer">
                  <Form.Label className="mb-0">
                    <ModalImmersInfo>Immer</ModalImmersInfo> or Website domain
                  </Form.Label>
                  <Form.Control type="text" value={immer} onChange={(e) => setImmer(e.target.value)} />
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
            <p>Click/touch and drag on your avatar to get that perfect pose</p>
            <Button onClick={handleScreenshot}>Snap</Button>
          </li>
        </ol>
        <ModalCheckResult
          show={showCheckResult}
          compat={compat}
          handleResponse={handleCheckResponse}
          profile={profile}
        />
        <p>Step: {step}</p>
        <button onClick={onClaimAvatar} className="primary">
          Claim avatar
        </button>
      </SimpleBar>
    </div>
  );
}
