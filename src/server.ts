// DO NOT DELETE THIS FILE!!!
// This file is a good smoke test to make sure the custom server entry is working
import handler from "@tanstack/react-start/server-entry";
import {
  oAuthDiscoveryMetadata,
  oAuthProtectedResourceMetadata,
} from "better-auth/plugins";
import { auth } from "@/lib/auth/auth";

const oauthDiscoveryHandler = oAuthDiscoveryMetadata(auth);
const protectedResourceHandler = oAuthProtectedResourceMetadata(auth);

export default {
  async fetch(request: Request) {
    const url = new URL(request.url);

    if (url.pathname === "/.well-known/oauth-authorization-server") {
      return oauthDiscoveryHandler(request);
    }

    if (url.pathname === "/.well-known/oauth-protected-resource") {
      return protectedResourceHandler(request);
    }

    return handler.fetch(request);
  },
};
