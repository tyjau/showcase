// @vitest-environment jsdom
//
// lib/analytics.ts drives GA4: event tracking + Consent Mode v2 consent updates. Both must be
// resilient no-ops when gtag isn't loaded (GA disabled or not yet ready), and consent must persist.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { trackEvent, setAnalyticsConsent, storedConsent, CONSENT_KEY } from "@/lib/analytics";

beforeEach(() => {
  localStorage.clear();
  delete (window as unknown as { gtag?: unknown }).gtag;
});

describe("trackEvent", () => {
  it("forwards the event name + params to gtag", () => {
    const gtag = vi.fn();
    (window as unknown as { gtag: unknown }).gtag = gtag;
    trackEvent("sign_up", { plan: "BUSINESS" });
    expect(gtag).toHaveBeenCalledWith("event", "sign_up", { plan: "BUSINESS" });
  });

  it("is a safe no-op when gtag is absent", () => {
    expect(() => trackEvent("sign_up")).not.toThrow();
  });
});

describe("analytics consent", () => {
  it("persists 'granted' and pushes a consent update to gtag", () => {
    const gtag = vi.fn();
    (window as unknown as { gtag: unknown }).gtag = gtag;
    setAnalyticsConsent(true);
    expect(localStorage.getItem(CONSENT_KEY)).toBe("granted");
    expect(gtag).toHaveBeenCalledWith("consent", "update", { analytics_storage: "granted" });
    expect(storedConsent()).toBe("granted");
  });

  it("persists 'denied' and reads it back", () => {
    setAnalyticsConsent(false);
    expect(storedConsent()).toBe("denied");
  });

  it("returns null when no choice has been made yet", () => {
    expect(storedConsent()).toBeNull();
  });
});
