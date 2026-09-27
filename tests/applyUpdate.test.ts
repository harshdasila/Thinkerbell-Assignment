import { describe, expect, it } from "vitest";
import { applyUpdate } from "../src/applyUpdate.js";
import type { Actor, DeviceRecord } from "../src/types.js";

describe("applyUpdate", () => {
  const currentRecord: DeviceRecord = {
    deviceId: "D01",
    siteId: "S01",
    version: 3,
    settings: {
      language: "en",
      volume: 2,
    },
  };

  const validActor: Actor = {
    siteId: "S01",
    role: "editor",
  };

  it("successfully performs partial volume update", () => {
    const request = {
      deviceId: "D01",
      expectedVersion: 3,
      settings: {
        volume: 4,
      },
    };

    const result = applyUpdate(currentRecord, validActor, request);

    expect(result).toEqual({
      status: 200,
      record: {
        deviceId: "D01",
        siteId: "S01",
        version: 4,
        settings: {
          language: "en",
          volume: 4,
        },
      },
    });
  });

  it("successfully performs partial language update", () => {
    const request = {
      deviceId: "D01",
      expectedVersion: 3,
      settings: {
        language: "hi",
      },
    };

    const result = applyUpdate(currentRecord, validActor, request);

    expect(result).toEqual({
      status: 200,
      record: {
        deviceId: "D01",
        siteId: "S01",
        version: 4,
        settings: {
          language: "hi",
          volume: 2,
        },
      },
    });
  });

  it("verifies inputs are not mutated", () => {
    const currentCopy = JSON.parse(JSON.stringify(currentRecord));
    const actorCopy = JSON.parse(JSON.stringify(validActor));
    const request = {
      deviceId: "D01",
      expectedVersion: 3,
      settings: {
        volume: 4,
      },
    };
    const requestCopy = JSON.parse(JSON.stringify(request));

    applyUpdate(currentRecord, validActor, request);

    expect(currentRecord).toEqual(currentCopy);
    expect(validActor).toEqual(actorCopy);
    expect(request).toEqual(requestCopy);
  });

  it("rejects non-editor role with 403", () => {
    const actor = { siteId: "S01", role: "viewer" };
    const request = {
      deviceId: "D01",
      expectedVersion: 3,
      settings: { volume: 4 },
    };

    const result = applyUpdate(currentRecord, actor, request);

    expect(result).toEqual({ status: 403, error: "FORBIDDEN" });
    expect(currentRecord.version).toBe(3);
    expect(currentRecord.settings.volume).toBe(2);
  });

  it("rejects wrong site with 403", () => {
    const actor = { siteId: "S02", role: "editor" };
    const request = {
      deviceId: "D01",
      expectedVersion: 3,
      settings: { volume: 4 },
    };

    const result = applyUpdate(currentRecord, actor, request);

    expect(result).toEqual({ status: 403, error: "FORBIDDEN" });
  });

  it("rejects request with unknown top-level key with 422", () => {
    const request = {
      deviceId: "D01",
      expectedVersion: 3,
      settings: { volume: 4 },
      extraKey: "unknown",
    };

    const result = applyUpdate(currentRecord, validActor, request);

    expect(result).toEqual({ status: 422, error: "INVALID_INPUT" });
  });

  it("rejects empty deviceId with 422", () => {
    const request = {
      deviceId: "",
      expectedVersion: 3,
      settings: { volume: 4 },
    };

    const result = applyUpdate(currentRecord, validActor, request);

    expect(result).toEqual({ status: 422, error: "INVALID_INPUT" });
  });

  it("rejects non-integer expectedVersion with 422", () => {
    const request = {
      deviceId: "D01",
      expectedVersion: 3.5,
      settings: { volume: 4 },
    };

    const result = applyUpdate(currentRecord, validActor, request);

    expect(result).toEqual({ status: 422, error: "INVALID_INPUT" });
  });

  it("rejects boolean expectedVersion with 422", () => {
    const request = {
      deviceId: "D01",
      expectedVersion: true,
      settings: { volume: 4 },
    };

    const result = applyUpdate(currentRecord, validActor, request);

    expect(result).toEqual({ status: 422, error: "INVALID_INPUT" });
  });

  it("rejects invalid language with 422", () => {
    const request = {
      deviceId: "D01",
      expectedVersion: 3,
      settings: { language: "fr" },
    };

    const result = applyUpdate(currentRecord, validActor, request);

    expect(result).toEqual({ status: 422, error: "INVALID_INPUT" });
  });

  it("rejects volume out of range with 422", () => {
    const request = {
      deviceId: "D01",
      expectedVersion: 3,
      settings: { volume: 6 },
    };

    const result = applyUpdate(currentRecord, validActor, request);

    expect(result).toEqual({ status: 422, error: "INVALID_INPUT" });
  });

  it("rejects boolean volume with 422", () => {
    const request = {
      deviceId: "D01",
      expectedVersion: 3,
      settings: { volume: true },
    };

    const result = applyUpdate(currentRecord, validActor, request);

    expect(result).toEqual({ status: 422, error: "INVALID_INPUT" });
  });

  it("rejects empty settings object with 422", () => {
    const request = {
      deviceId: "D01",
      expectedVersion: 3,
      settings: {},
    };

    const result = applyUpdate(currentRecord, validActor, request);

    expect(result).toEqual({ status: 422, error: "INVALID_INPUT" });
  });

  it("rejects unknown setting key with 422", () => {
    const request = {
      deviceId: "D01",
      expectedVersion: 3,
      settings: { theme: "dark" },
    };

    const result = applyUpdate(currentRecord, validActor, request);

    expect(result).toEqual({ status: 422, error: "INVALID_INPUT" });
  });

  it("rejects wrong deviceId with 404", () => {
    const request = {
      deviceId: "D99",
      expectedVersion: 3,
      settings: { volume: 4 },
    };

    const result = applyUpdate(currentRecord, validActor, request);

    expect(result).toEqual({ status: 404, error: "NOT_FOUND" });
  });

  it("rejects stale version with 409", () => {
    const request = {
      deviceId: "D01",
      expectedVersion: 2,
      settings: { volume: 4 },
    };

    const result = applyUpdate(currentRecord, validActor, request);

    expect(result).toEqual({ status: 409, error: "CONFLICT" });
  });

  it("enforces validation order of 403 over 422", () => {
    const actor = { siteId: "S01", role: "viewer" };
    const request = { deviceId: "", expectedVersion: -1, settings: {} };

    const result = applyUpdate(currentRecord, actor, request);

    expect(result).toEqual({ status: 403, error: "FORBIDDEN" });
  });

  it("enforces validation order of 422 over 404", () => {
    const request = {
      deviceId: "WRONG",
      expectedVersion: 3,
      settings: { volume: 99 },
    };

    const result = applyUpdate(currentRecord, validActor, request);

    expect(result).toEqual({ status: 422, error: "INVALID_INPUT" });
  });

  it("enforces validation order of 404 over 409", () => {
    const request = {
      deviceId: "WRONG",
      expectedVersion: 99,
      settings: { volume: 4 },
    };

    const result = applyUpdate(currentRecord, validActor, request);

    expect(result).toEqual({ status: 404, error: "NOT_FOUND" });
  });
});
