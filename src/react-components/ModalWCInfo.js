import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";

export function ModalWCInfo({ children }) {
  const [show, setShow] = useState(false);
  const handleOpen = (e) => {
    e.preventDefault();
    setShow(true);
  };
  const handleClose = () => setShow(false);
  return (
    <>
      <a className="info-modal-link" href="#" onClick={handleOpen}>
        {children}
      </a>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header>
          <Modal.Title>What is a WebCollectible?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          WebCollectibles are a system for sharing and collecting digital items on the Web using{" "}
          <a href="https://activitypub.rocks/" target="_blank">
            ActivityPub
          </a>
          , a non-blockhain federated ledger that doesn't need wasteful consensus work and allows anyone to participate
          without requiring permission or expensive equipment.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
