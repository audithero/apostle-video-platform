export interface HeyGenAvatar {
  avatar_id: string;
  avatar_name: string;
  preview_image_url: string;
  preview_video_url?: string;
  gender: "male" | "female";
  type: "standard" | "premium";
}

export interface HeyGenVoice {
  voice_id: string;
  name: string;
  language: string;
  gender: "male" | "female";
  preview_audio_url?: string;
  emotion_support: boolean;
}

export interface VideoGenerateRequest {
  avatar_id: string;
  voice_id: string;
  script: string;
  title?: string;
  caption?: boolean;
  dimension?: { width: number; height: number };
}

export interface VideoGenerateResponse {
  video_id: string;
  status: "pending" | "processing" | "completed" | "failed";
}

export interface VideoStatusResponse {
  video_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  video_url?: string;
  duration?: number;
  thumbnail_url?: string;
  error?: string;
}

export interface HeyGenWebhookPayload {
  event_type: "video.completed" | "video.failed" | "video.expired";
  video_id: string;
  video_url?: string;
  duration?: number;
  thumbnail_url?: string;
  error?: string;
}
