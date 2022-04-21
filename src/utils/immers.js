import { ImmersClient, catchToken, Activities } from "immers-client";
catchToken();
let shopKeep;
let shopKeepActivities;
export const immersClient = new ImmersClient(
  {},
  {
    localImmer: window.location.origin,
  }
);

export async function getShopKeepActivities() {
  if (shopKeepActivities) {
    return shopKeepActivities;
  }
  if (!shopKeep) {
    shopKeep = await window
      .fetch("/u/shopkeep", {
        headers: {
          Accept: Activities.JSONLDMime,
        },
      })
      .then((res) => res.json())
      .catch((err) => {
        console.error(err);
      });
    // replace the real endpoint with immers plugin one that allows web users to create on shopkeep's behalf
    shopKeep.endpoints.uploadMedia = `${window.location.origin}/create-treasure`;
  }
  shopKeepActivities = new Activities(shopKeep, window.location.origin, immersClient.place);
  return shopKeepActivities;
}
