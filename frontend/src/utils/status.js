// src/utils/status.js
// Project lifecycle status → badge tone mapping.
// Single source of truth shared by cards and detail pages.

export const STATUS_TONES = {
  Active: "status-badge--active",
  Delayed: "status-badge--delayed",
  Completed: "status-badge--completed",
};

export function statusToneClass(status) {
  return STATUS_TONES[status] || "status-badge--default";
}
