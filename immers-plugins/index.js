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
        to: [requestorId],
        cc: [apex.consts.publicAddress, shopKeep.followers[0]],
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
      const to = [apex.consts.publicAddress];
      const cc = [claimee.id, shopKeep.followers[0]];
      const handle = `${claimee.preferredUsername}@${new URL(requestorId).host}`;
      const tag = `<span class="h-card"><a href="${
        claimee.url || claimee.id
      }" class="u-url mention">@<span>${handle}</span></a></span>`;
      const createNote = await apex.buildActivity("Create", shopKeepId, to, {
        inReplyTo: create.id,
        object: {
          id: apex.utils.objectIdToIRI(),
          type: "Note",
          attributedTo: shopKeepId,
          content: `<p>This <a href="${create.id}">Nice Free Treasure</a> was created for ${tag}</p>`,
          tag: [{ type: "Mention", href: claimee.id, name: `@${handle}` }],
          to,
          cc,
        },
        to,
        cc,
      });
      createNote.object[0].published = createNote.published;
      await apex.store.saveObject(createNote.object[0]);
      if (apex.domain.startsWith("localhost")) {
        console.log("Not delivering activity in dev mode", JSON.stringify(createNote, undefined, 2));
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
