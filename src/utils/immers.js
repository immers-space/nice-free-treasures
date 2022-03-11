import { ImmersClient } from "immers-client";

export const immersClient = new ImmersClient(
  {},
  {
    localImmer: window.location.origin,
  }
);
