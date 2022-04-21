import { ImmersClient } from "immers-client";
import React, { useCallback, useState } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import { useStore } from "../store";
import { immersClient } from "../utils/immers";

export function ModalClaimed({ nftUrl, compat }) {
  const profile = useStore(useCallback((state) => state.profile));
  const [collecting, setCollecting] = useState("");
  const handleCollect = useCallback(async () => {
    setCollecting("pending");
    try {
      if (!immersClient.connected) {
        await immersClient.login(window.location.href, "modAdditive", profile.handle);
      }
      await immersClient.addAvatar(nftUrl);
      const treasureOffer = await immersClient.activities.getObject(nftUrl);
      await immersClient.activities.updateProfile({
        icon: ImmersClient.URLFromProperty(treasureOffer.object.icon),
        avatar: treasureOffer.object,
      });
      setCollecting("done");
    } catch (error) {
      console.error(error);
      setCollecting("");
    }
  }, [profile, nftUrl]);
  let twitterIntent;
  if (profile.homeImmer === "twitter.com") {
    twitterIntent = new URL("https://twitter.com/intent/tweet");
    const params = new URLSearchParams({
      text: "I just claimed this Nice Free Treasure!",
      url: nftUrl,
      via: "immersspace",
    });
    twitterIntent.search = params.toString();
  }
  return (
    <Modal className="modal-claimed" show={!!nftUrl}>
      <Modal.Header>
        <Modal.Title>Your Nice Free Treasure</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Congratulations! Your Nice Free Treasure has been created. You can share this link to prove that it was
          created for you on the ActivityPub federated ledger:
          <br />
          <a href={nftUrl}>{nftUrl}</a>
        </p>
        {compat === "WebCollectibles" && (
          <p>
            <Button variant="primary" onClick={handleCollect} disabled={!!collecting}>
              Set as My Avatar
              {collecting == "pending" && <Spinner animation="border" size="sm" />}
              {collecting == "done" && " ✔️"}
            </Button>
          </p>
        )}
        {compat === "ActivityPub" && <p>A link to this has been shared to you timeline as well.</p>}
        {twitterIntent && (
          <p>
            <Button variant="primary" href={twitterIntent.href}>
              Share on Twitter
            </Button>
          </p>
        )}
        <iframe className="activity-embed" allow="monetization fullscreen xr-spatial-tracking" src={nftUrl} />
      </Modal.Body>
    </Modal>
  );
}
