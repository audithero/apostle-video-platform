import type { SDUIScreen } from "./types.js";

export const SDUI_ACTION_TYPES = [
  "navigate",
  "deepLink",
  "apiCall",
  "openUrl",
  "showModal",
  "dismissModal",
  "submitForm",
  "trackEvent",
  "playVideo",
  "toggleState",
] as const;

export type SDUIActionType = (typeof SDUI_ACTION_TYPES)[number];

export const SDUI_API_METHODS = [
  "GET",
  "POST",
  "PUT",
  "DELETE",
] as const;

export type SDUIApiMethod = (typeof SDUI_API_METHODS)[number];

export interface SDUINavigateAction {
  type: "navigate";
  to: string;
  params?: Record<string, string>;
}

export interface SDUIDeepLinkAction {
  type: "deepLink";
  url: string;
  fallback?: string;
}

export interface SDUIApiCallAction {
  type: "apiCall";
  endpoint: string;
  method: SDUIApiMethod;
  body?: Record<string, unknown>;
  onSuccess?: SDUIAction;
  onError?: SDUIAction;
}

export interface SDUIOpenUrlAction {
  type: "openUrl";
  url: string;
  external?: boolean;
}

export interface SDUIShowModalAction {
  type: "showModal";
  screen: SDUIScreen;
}

export interface SDUIDismissModalAction {
  type: "dismissModal";
}

export interface SDUISubmitFormAction {
  type: "submitForm";
  formId: string;
  endpoint: string;
}

export interface SDUITrackEventAction {
  type: "trackEvent";
  name: string;
  properties?: Record<string, unknown>;
}

export interface SDUIPlayVideoAction {
  type: "playVideo";
  videoUrl: string;
  autoplay?: boolean;
}

export interface SDUIToggleStateAction {
  type: "toggleState";
  key: string;
  value?: unknown;
}

export type SDUIAction =
  | SDUINavigateAction
  | SDUIDeepLinkAction
  | SDUIApiCallAction
  | SDUIOpenUrlAction
  | SDUIShowModalAction
  | SDUIDismissModalAction
  | SDUISubmitFormAction
  | SDUITrackEventAction
  | SDUIPlayVideoAction
  | SDUIToggleStateAction;
