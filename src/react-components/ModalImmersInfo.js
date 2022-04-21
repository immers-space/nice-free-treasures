import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";

export function ModalImmersInfo({ children }) {
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
          <Modal.Title>What is a immer?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            An immer is an Immersive Web experiences and its user community. Using open Web standards for federated
            social media, each immer is connected to others through the relationships people create across platforms
            while still remaining independent. This is made possible with the free, self-hosted immers server developed
            by Immers Space.
          </p>
          <p>If you're an immerser, your enter the domain of your home immer, e.g. immers.space</p>
          <p>If you use a different ActivityPub app like Mastodon, enter your instance domain, e.g. mastodon.social</p>
          <p>If you use a closed network like Twitter, enter the site, e.g. twitter.com</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" href="https://web.immers.space/what-is-immers-space/" target="_blank">
            Learn More
          </Button>
          <Button variant="primary" onClick={handleClose}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
