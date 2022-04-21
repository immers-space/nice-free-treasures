import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";

export function ModalCheckResult({ show, compat, handleResponse, profile }) {
  return (
    <Modal show={show} onHide={() => handleResponse(true)}>
      <Modal.Header>
        <Modal.Title>Can I claim a WebCollectible?</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {compat === "fallback" && (
          <p>
            Your provider doesn't apear to support open Web standards. We can still create your collectible and provide
            a sharable link.
          </p>
        )}
        {compat === "ActivityPub" && (
          <p>
            Hi, {profile.displayName}! Your provider supports open Web standards, but not WebCollectibles. We'll create
            your collectible and share it to your timeline.
          </p>
        )}
        {compat === "WebCollectibles" && (
          <p>
            Hi, {profile.displayName}! Your provider supports WebCollectibles. You can add this directly to your
            collections.
          </p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => handleResponse(false)}>
          Go Back
        </Button>
        <Button variant="primary" onClick={() => handleResponse(true)}>
          OK
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
