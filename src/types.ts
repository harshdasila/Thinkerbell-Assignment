export interface DeviceSettings {
  language: "en" | "hi" | "kn";
  volume: number;
}

export interface DeviceRecord {
  deviceId: string;
  siteId: string;
  version: number;
  settings: DeviceSettings;
}

export interface Actor {
  siteId: string;
  role: string;
}

export interface UpdateRequest {
  deviceId: string;
  expectedVersion: number;
  settings: Partial<DeviceSettings>;
}

export type ApplyUpdateResult =
  | { status: 200; record: DeviceRecord }
  | { status: 403; error: "FORBIDDEN" }
  | { status: 422; error: "INVALID_INPUT" }
  | { status: 404; error: "NOT_FOUND" }
  | { status: 409; error: "CONFLICT" };
