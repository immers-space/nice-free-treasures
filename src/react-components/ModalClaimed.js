import { ImmersClient } from "immers-client";
import React, { useCallback, useEffect, useState } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import { useStore } from "../store";
import { getShopKeepActivities, immersClient } from "../utils/immers";

export function ModalClaimed({ nftUrl, compat }) {
  const profile = useStore(useCallback((state) => state.profile));
  const [collecting, setCollecting] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [glbUrl, setGlbUrl] = useState("");
  useEffect(async () => {
    if (!nftUrl) {
      return;
    }
    const nft = await (await getShopKeepActivities()).getObject(nftUrl);
    setImageUrl(ImmersClient.URLFromProperty(nft.object.icon));
    setGlbUrl(ImmersClient.URLFromProperty(nft.object));
  }, [nftUrl, setImageUrl, setGlbUrl]);
  const handleCollect = useCallback(async () => {
    setCollecting("pending");
    try {
      if (!immersClient.connected) {
        await immersClient.login(window.location.href, "modAdditive", profile.handle);
      }
      await immersClient.addAvatar(nftUrl);
      await immersClient.useAvatar(nftUrl);
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
        <p className="text-overflow">
          Congratulations! Your Nice Free Treasure has been created. You can share this link to prove that it was
          created for you on the ActivityPub federated ledger:
          <br />
          <a href={nftUrl}>{nftUrl}</a>
        </p>
        {compat === "ActivityPub" && (
          <h5>A link to this has been shared to you timeline &ndash; boost it to show off your treasure.</h5>
        )}
        <p className="claimed-actions">
          {compat === "WebCollectibles" && (
            <Button variant="primary" onClick={handleCollect} disabled={!!collecting}>
              Set Avatar
              {collecting == "pending" && <Spinner animation="border" size="sm" />}
              {collecting == "done" && " ✔️"}
            </Button>
          )}
          {twitterIntent && (
            <Button variant="primary" href={twitterIntent.href}>
              Share on Twitter
            </Button>
          )}
          <Button variant="secondary" href={imageUrl} download disabled={!imageUrl}>
            Save Image
          </Button>
          <Button variant="secondary" href={glbUrl} download disabled={!glbUrl}>
            Save Model
          </Button>
        </p>
        {collecting == "done" && (
          <p>
            <a target="_blank" href={`${profile.id}/Inbox`}>
              View on your profile
            </a>
          </p>
        )}
        <iframe className="activity-embed" allow="monetization fullscreen xr-spatial-tracking" src={nftUrl} />
      </Modal.Body>
    </Modal>
  );
}
