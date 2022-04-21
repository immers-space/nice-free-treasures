"use strict";
const { createAccessToken, getUserByName } = require("../../src/authdb.js");
console.log("======Loaded immers plugin=======");

module.exports = function (app, immer, apex) {
  const shopKeepId = `https://${apex.domain}/u/shopkeep`;
  let shopKeep;
  let shopKeepUser;
  app.post("/create-treasure", async (req, res, next) => {
    try {
      if (!shopKeepUser) {
        shopKeepUser = await getUserByName("shopkeep");
      }
      const tokenOpts = {
        scope: ["creative"],
        origin: `https://${apex.domain}`,
      };
      const client = {
        clientId: immer.id,
      };
      createAccessToken(client, shopKeepUser, tokenOpts, (err, token) => {
        if (err) {
          throw new Error(err.toString());
        }
        // add authoriation and forward to standard media posting route
        req.headers.authorization = `Bearer ${token}`;
        req.url = "/media";
        app._router.handle(req, res, next);
      });
    } catch (err) {
      return next(err);
    }
  });
  // For WebCollectible compat users, offer the treasure
  app.post("/claim-treasure", async (req, res, next) => {
    try {
      const { requestorId, createdId } = req.body;
      if (!requestorId || !createdId) {
        return res.sendStatus(400);
      }
      if (!shopKeep) {
        shopKeep = await apex.store.getObject(shopKeepId, true);
      }
      const create = await apex.store.getActivity(createdId);
      const claimee = await apex.resolveObject(requestorId);
      const handle = `${claimee.preferredUsername}[${new URL(requestorId).host}]`;
      const offer = await apex.buildActivity("Offer", shopKeepId, claimee.id, {
        inReplyTo: create.id,
        object: create.object,
        target: claimee.streams?.avatars ?? claimee.streams?.collectibles ?? claimee.id,
        to: [apex.consts.publicAddress, shopKeep.followers[0], requestorId],
        summary: `<span>${shopKeep.name} offered this Nice Free Treasure to ${handle}</span>`,
      });
      await apex.addToOutbox(shopKeep, offer);
      res.set("Location", offer.id);
      res.status(201);
      res.send();
    } catch (err) {
      return next(err);
    }
  });
  // for other AP users, just post to their timeline
  app.post("/share-treasure", async (req, res, next) => {
    try {
      const { requestorId, createdId } = req.body;
      if (!requestorId || !createdId) {
        return res.sendStatus(400);
      }
      if (!shopKeep) {
        shopKeep = await apex.store.getObject(shopKeepId, true);
      }
      const create = await apex.store.getActivity(createdId);
      const claimee = await apex.resolveObject(requestorId);
      const to = [apex.consts.publicAddress, shopKeep.followers[0], claimee.id];
      const handle = `@${claimee.preferredUsername}@${new URL(requestorId).host}`;
      const createNote = await apex.buildActivity("Create", shopKeepId, claimee.id, {
        inReplyTo: create.id,
        object: {
          type: "Note",
          attributedTo: shopKeepId,
          content: `This <a href=${create.object.id}>Nice Free Treasure</a> was created for ${handle}`,
          to,
        },
        to,
      });
      if (apex.domain.startsWith("localhost")) {
        console.log("Not delivering activity in dev mode");
        await apex.store.saveActivity(createNote);
      } else {
        await apex.addToOutbox(shopKeep, createNote);
      }
      res.set("Location", createNote.id);
      res.status(201);
      res.send();
    } catch (err) {
      return next(err);
    }
  });
};
