import type {
  HeyGenAvatar,
  HeyGenVoice,
  VideoGenerateRequest,
  VideoGenerateResponse,
  VideoStatusResponse,
} from "./types";

const HEYGEN_BASE_URL = "https://api.heygen.com";
const MAX_RETRIES = 3;
const WORDS_PER_MINUTE = 150;

interface HeyGenClientOptions {
  apiKey: string;
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = MAX_RETRIES,
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const response = await fetch(url, options);

    if (response.status === 429 && attempt < retries) {
      const retryAfter = response.headers.get("retry-after");
      const delay = retryAfter ? Number.parseInt(retryAfter, 10) * 1000 : 2 ** attempt * 1000;
      await new Promise((resolve) => {
        setTimeout(resolve, delay);
      });
      continue;
    }

    if (response.status >= 500 && attempt < retries) {
      await new Promise((resolve) => {
        setTimeout(resolve, 2 ** attempt * 1000);
      });
      continue;
    }

    return response;
  }

  throw new Error("Max retries exceeded for HeyGen API");
}

export function createHeyGenClient({ apiKey }: HeyGenClientOptions) {
  const headers = {
    "X-Api-Key": apiKey,
    "Content-Type": "application/json",
  };

  return {
    async listAvatars(): Promise<HeyGenAvatar[]> {
      const response = await fetchWithRetry(`${HEYGEN_BASE_URL}/v2/avatars`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to list avatars: ${String(response.status)}`);
      }

      const data = (await response.json()) as { data: { avatars: HeyGenAvatar[] } };
      return data.data.avatars;
    },

    async listVoices(): Promise<HeyGenVoice[]> {
      const response = await fetchWithRetry(`${HEYGEN_BASE_URL}/v2/voices`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to list voices: ${String(response.status)}`);
      }

      const data = (await response.json()) as { data: { voices: HeyGenVoice[] } };
      return data.data.voices;
    },

    async generateVideo(request: VideoGenerateRequest): Promise<VideoGenerateResponse> {
      const body = {
        video_inputs: [
          {
            character: {
              type: "avatar",
              avatar_id: request.avatar_id,
              avatar_style: "normal",
            },
            voice: {
              type: "text",
              input_text: request.script,
              voice_id: request.voice_id,
            },
          },
        ],
        dimension: request.dimension ?? { width: 1920, height: 1080 },
        caption: request.caption ?? false,
        title: request.title,
      };

      const response = await fetchWithRetry(`${HEYGEN_BASE_URL}/v2/video/generate`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to generate video: ${errorText}`);
      }

      const data = (await response.json()) as { data: VideoGenerateResponse };
      return data.data;
    },

    async getVideoStatus(videoId: string): Promise<VideoStatusResponse> {
      const response = await fetchWithRetry(
        `${HEYGEN_BASE_URL}/v1/video_status.get?video_id=${videoId}`,
        { method: "GET", headers },
      );

      if (!response.ok) {
        throw new Error(`Failed to get video status: ${String(response.status)}`);
      }

      const data = (await response.json()) as { data: VideoStatusResponse };
      return data.data;
    },

    async downloadVideo(videoUrl: string): Promise<ArrayBuffer> {
      const response = await fetch(videoUrl);
      if (!response.ok) {
        throw new Error(`Failed to download video: ${String(response.status)}`);
      }
      return response.arrayBuffer();
    },

    estimateDurationMinutes(script: string): number {
      const wordCount = script.split(/\s+/).filter(Boolean).length;
      return Math.ceil(wordCount / WORDS_PER_MINUTE);
    },

    estimateCostCents(durationMinutes: number, quality: "standard" | "premium" = "standard"): number {
      const ratePerMinute = quality === "premium" ? 600 : 200; // $6 or $2 per minute
      return durationMinutes * ratePerMinute;
    },
  };
}

export type HeyGenClient = ReturnType<typeof createHeyGenClient>;
