"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { ShieldCheck, KeyRound, Bell, UserRound } from "lucide-react";
import { apiAuthed, getWorkspace, getSessionName, getSessionAvatar, apiUpdateAvatar, apiUpdateName } from "@/lib/api";
import { harmonyHref, harmonyLabel } from "@/lib/harmony";

type Dict = Record<string, string>;

function initials(name: string | null): string {
  if (!name) return "•";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() || "•";
}

// Presentational toggle (profile/security/notifications are managed in the Harmony
// product; the billing portal mirrors the controls and links out for real changes).
function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onClick}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? "bg-sky-strong" : "bg-line"}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

// Settings (#5) — reversible account closure. request_account_deletion flags the
// subscription non-renewing (access until term end, NO immediate hard delete); the customer
// can undo. The impact is spelled out before the confirm.
export function SettingsSection({ dict }: { dict: Dict }) {
  const [scheduled, setScheduled] = useState<boolean | null>(null);
  const [accessUntil, setAccessUntil] = useState<string>("");
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [workspace, setWorkspace] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoErr, setPhotoErr] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [nameBusy, setNameBusy] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const notifLabels = (dict.setNotif as unknown as string[]) ?? [];
  // Each notification label maps to a backend key (users.preferences.notifications).
  const NOTIF_KEYS = ["billing", "product", "security"] as const;
  const [notif, setNotif] = useState<boolean[]>(() => notifLabels.map(() => true));
  const harmonyUrl = harmonyHref(workspace);

  useEffect(() => {
    setWorkspace(getWorkspace());
    setAvatar(getSessionAvatar());
    setDisplayName(getSessionName());
    setNameInput(getSessionName() || "");
    apiAuthed("my_consumption").then((res) => {
      const d = res.data || {};
      setScheduled(!!d.cancellation_scheduled);
      setAccessUntil((d.access_until as string) || "");
    });
    apiAuthed("my_notification_prefs").then((res) => {
      const n = (res.data?.notifications ?? {}) as Record<string, boolean>;
      setNotif(NOTIF_KEYS.map((k) => n[k] !== false)); // default opt-in
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist a single notification toggle to the backend (optimistic).
  function toggleNotif(i: number) {
    const next = !notif[i];
    setNotif((arr) => arr.map((v, j) => (j === i ? next : v)));
    apiAuthed("update_notification_prefs", { [NOTIF_KEYS[i]]: next });
  }

  // Avatar upload: read the picked image to a data-URL and persist via update_profile.
  async function onPickPhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file
    if (!file) return;
    setPhotoErr(null);
    if (file.size > 500 * 1024) {
      setPhotoErr(dict.setPhotoTooBig);
      return;
    }
    setPhotoBusy(true);
    const dataUrl = await new Promise<string>((resolve) => {
      const fr = new FileReader();
      fr.onload = () => resolve(String(fr.result));
      fr.onerror = () => resolve("");
      fr.readAsDataURL(file);
    });
    if (!dataUrl) {
      setPhotoBusy(false);
      setPhotoErr(dict.setPhotoTooBig);
      return;
    }
    const res = await apiUpdateAvatar(dataUrl);
    setPhotoBusy(false);
    if (res.ok) setAvatar(dataUrl);
    else setPhotoErr(res.error || dict.payError);
  }

  // Persist the display name (updates the greeting + header via the profile event).
  async function saveName() {
    const next = nameInput.trim();
    if (!next || next === (displayName || "")) return;
    setNameBusy(true);
    setNameSaved(false);
    const res = await apiUpdateName(next);
    setNameBusy(false);
    if (res.ok) {
      setDisplayName(next);
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2500);
    }
  }

  async function requestDeletion() {
    setBusy(true);
    const res = await apiAuthed("request_account_deletion", {});
    setBusy(false);
    setConfirming(false);
    if (res.ok) {
      setScheduled(true);
      setAccessUntil((res.data?.access_until as string) || accessUntil);
    }
  }

  async function undo() {
    setBusy(true);
    const res = await apiAuthed("cancel_account_deletion", {});
    setBusy(false);
    if (res.ok) setScheduled(false);
  }

  if (scheduled === null) return <p className="text-muted">{dict.loading}</p>;

  return (
    <div className="flex flex-col gap-6">
      {/* Profile */}
      <div className="rounded-xl border border-line bg-surface p-5">
        <h3 className="flex items-center gap-2 text-lg font-bold text-heading">
          <UserRound size={18} className="text-sky-text" /> {dict.setProfileTitle}
        </h3>
        <div className="mt-4 flex items-center gap-4">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt="" className="h-14 w-14 flex-none rounded-full object-cover" />
          ) : (
            <span className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-sky-strong text-lg font-bold text-white">
              {initials(displayName)}
            </span>
          )}
          <div className="min-w-0">
            <label className="inline-flex cursor-pointer items-center rounded-full border border-line px-4 py-2 text-sm font-semibold text-heading transition hover:border-sky">
              <input
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={onPickPhoto}
                disabled={photoBusy}
              />
              {photoBusy ? dict.setPhotoSaving : dict.setPhotoChange}
            </label>
            <p className="mt-1.5 text-xs text-muted">{dict.setPhotoHint}</p>
            {photoErr && <p className="mt-1 text-xs text-err-fg">{photoErr}</p>}
          </div>
        </div>
        {/* Display name — editable, persisted via update_profile (greeting + header refresh) */}
        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium text-ink">{dict.setNameLabel}</label>
          <div className="flex items-stretch gap-2">
            <input
              value={nameInput}
              onChange={(e) => {
                setNameInput(e.target.value);
                setNameSaved(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && saveName()}
              placeholder={dict.setNamePh}
              className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-sky"
            />
            <button
              type="button"
              onClick={saveName}
              disabled={nameBusy || !nameInput.trim() || nameInput.trim() === (displayName || "")}
              className="shrink-0 rounded-lg bg-sky-strong px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {nameBusy ? dict.setPhotoSaving : dict.setNameSave}
            </button>
          </div>
          {nameSaved && <p className="mt-1 text-xs text-ok-fg">{dict.setNameSaved}</p>}
        </div>
        <div className="mt-4 flex items-center justify-between gap-4 border-b border-line pb-3">
          <span className="text-sm text-muted">{dict.setWorkspaceLabel}</span>
          <span className="text-sm font-medium text-ink">{harmonyLabel(workspace)}</span>
        </div>
        <p className="mt-3 text-sm text-muted">{dict.setManaged}</p>
        <a href={harmonyUrl} className="mt-3 inline-flex text-sm font-semibold text-sky-text hover:underline">
          {dict.setManageLink} →
        </a>
      </div>

      {/* Security */}
      <div className="rounded-xl border border-line bg-surface p-5">
        <h3 className="flex items-center gap-2 text-lg font-bold text-heading">
          <ShieldCheck size={18} className="text-sky-text" /> {dict.setSecurityTitle}
        </h3>
        <div className="mt-3 flex items-center justify-between gap-4 border-b border-line pb-3">
          <span className="inline-flex items-center gap-2 text-sm text-ink">
            <KeyRound size={15} className="text-muted" /> {dict.setPassword} <span className="text-muted">••••••••</span>
          </span>
          <a href={harmonyUrl} className="text-sm font-semibold text-sky-text hover:underline">{dict.setChange}</a>
        </div>
        <div className="mt-3 flex items-center justify-between gap-4">
          <span className="text-sm text-ink">
            {dict.set2fa} <span className="ml-1 text-xs text-ok-fg">· {dict.setEnabled}</span>
          </span>
          <a href={harmonyUrl} className="text-sm font-semibold text-sky-text hover:underline">{dict.setChange}</a>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-xl border border-line bg-surface p-5">
        <h3 className="flex items-center gap-2 text-lg font-bold text-heading">
          <Bell size={18} className="text-sky-text" /> {dict.setNotifTitle}
        </h3>
        <div className="mt-3 divide-y divide-line">
          {notifLabels.map((label, i) => (
            <div key={label} className="flex items-center justify-between gap-4 py-3">
              <span className="text-sm text-ink">{label}</span>
              <Toggle on={notif[i]} onClick={() => toggleNotif(i)} label={label} />
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-xl border border-err-border bg-err-bg p-5">
      <h3 className="text-lg font-bold text-heading">{dict.delTitle}</h3>
      {scheduled ? (
        <>
          <p className="mt-2 text-sm text-ink">
            {dict.delScheduled} {accessUntil && <b>{accessUntil}</b>}.
          </p>
          <button
            onClick={undo}
            disabled={busy}
            className="mt-4 rounded-full bg-sky-strong px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? dict.paySaving : dict.delUndo}
          </button>
        </>
      ) : (
        <>
          <p className="mt-2 text-sm text-muted">{dict.delImpact}</p>
          {!confirming ? (
            <button
              onClick={() => setConfirming(true)}
              className="mt-4 rounded-full border border-err-fg px-6 py-2.5 text-sm font-semibold text-err-fg hover:bg-err-bg"
            >
              {dict.delButton}
            </button>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={requestDeletion}
                disabled={busy}
                className="rounded-full bg-[#b4441f] px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {busy ? dict.paySaving : dict.delConfirm}
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="rounded-full border border-line px-6 py-2.5 text-sm font-semibold text-muted"
              >
                {dict.payCancel}
              </button>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
}
