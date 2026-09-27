import type { Actor, ApplyUpdateResult, DeviceRecord } from "./types.js";
import { updateRequestSchema } from "./schemas.js";

export function applyUpdate(
  current: DeviceRecord,
  actor: Actor,
  request: unknown
): ApplyUpdateResult {
  if (actor.role !== "editor" || actor.siteId !== current.siteId) {
    return {
      status: 403,
      error: "FORBIDDEN",
    };
  }

  const parseResult = updateRequestSchema.safeParse(request);
  if (!parseResult.success) {
    return {
      status: 422,
      error: "INVALID_INPUT",
    };
  }

  const validRequest = parseResult.data;

  if (validRequest.deviceId !== current.deviceId) {
    return {
      status: 404,
      error: "NOT_FOUND",
    };
  }

  if (validRequest.expectedVersion !== current.version) {
    return {
      status: 409,
      error: "CONFLICT",
    };
  }

  return {
    status: 200,
    record: {
      ...current,
      version: current.version + 1,
      settings: {
        language: validRequest.settings.language ?? current.settings.language,
        volume: validRequest.settings.volume ?? current.settings.volume,
      },
    },
  };
}
