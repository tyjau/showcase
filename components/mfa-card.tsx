"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ShieldCheck, ShieldAlert, Copy, Check } from "lucide-react";
import { apiAuthed } from "@/lib/api";

type Dict = Record<string, string>;

/**
 * 2FA (TOTP) — enrôlement + désactivation, dans le portail compte.
 *
 * Le back (MfaService) fait tout : `mfa_setup` renvoie {secret, otpauth_uri} ; `mfa_enable{code}`
 * confirme et renvoie les codes de secours UNE SEULE FOIS ; `mfa_disable{code}` coupe — un code
 * VALIDE est exigé, ce qui protège contre une session détournée qui voudrait retirer la 2FA.
 *
 * ⚠️ Le QR est rendu DANS LE NAVIGATEUR : l'URI otpauth CONTIENT le secret TOTP, il ne doit jamais
 * transiter par un service de QR tiers.
 *
 * Remplace l'ancienne ligne « 2FA · Activé » qui était codée en dur (elle affichait « activé » pour
 * tout le monde, quel que soit l'état réel, et renvoyait vers Harmony qui n'a pas d'écran MFA).
 */
export function MfaCard({ dict }: { dict: Dict }) {
  const [state, setState] = useState<"loading" | "off" | "enrolling" | "codes" | "on">("loading");
  const [uri, setUri] = useState("");
  const [secret, setSecret] = useState("");
  const [codes, setCodes] = useState<string[]>([]);
  const [code, setCode] = useState("");
  const [disabling, setDisabling] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    apiAuthed("mfa_status").then((res) => setState(res.ok && res.data?.enabled ? "on" : "off"));
  }, []);

  async function begin() {
    setErr(null);
    setBusy(true);
    const res = await apiAuthed("mfa_setup", {});
    setBusy(false);
    const otpauth = res.data?.otpauth_uri as string | undefined;
    if (!res.ok || !otpauth) {
      setErr(dict.mfaErrSetup ?? "Impossible de démarrer l'activation. Réessaie.");
      return;
    }
    setUri(otpauth);
    setSecret(String(res.data?.secret ?? ""));
    setCode("");
    setState("enrolling");
  }

  async function confirm() {
    setErr(null);
    setBusy(true);
    const res = await apiAuthed("mfa_enable", { code: code.trim() });
    setBusy(false);
    if (!res.ok) {
      setErr(dict.mfaErrCode ?? "Code invalide. Vérifie l'heure de ton téléphone et réessaie.");
      return;
    }
    setCodes((res.data?.recovery_codes as string[]) ?? []);
    setUri("");
    setSecret(""); // le secret ne reste pas en mémoire une fois l'enrôlement confirmé
    setCode("");
    setState("codes");
  }

  async function disable() {
    setErr(null);
    setBusy(true);
    const res = await apiAuthed("mfa_disable", { code: code.trim() });
    setBusy(false);
    if (!res.ok) {
      setErr(dict.mfaErrCode ?? "Code invalide. Réessaie.");
      return;
    }
    setCode("");
    setDisabling(false);
    setState("off");
  }

  function copyCodes() {
    navigator.clipboard?.writeText(codes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const codeInput = (
    <input
      value={code}
      onChange={(e) => setCode(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && (state === "enrolling" ? confirm() : disable())}
      placeholder={dict.mfaCodePh ?? "Code à 6 chiffres"}
      autoComplete="one-time-code"
      className="w-40 rounded-lg border border-line px-3 py-2 font-mono text-sm outline-none focus:border-sky"
    />
  );

  if (state === "loading") {
    return <div className="mt-3 h-6 text-sm text-muted">{dict.loading}</div>;
  }

  return (
    <div className="mt-3">
      {/* Ligne d'état — reflète l'état RÉEL renvoyé par mfa_status */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-sm text-ink">
          {state === "on" ? (
            <ShieldCheck size={15} className="text-ok-fg" />
          ) : (
            <ShieldAlert size={15} className="text-muted" />
          )}
          {dict.set2fa}
          <span className={`ml-1 text-xs ${state === "on" ? "text-ok-fg" : "text-muted"}`}>
            · {state === "on" ? (dict.setEnabled ?? "Activée") : (dict.mfaOff ?? "Désactivée")}
          </span>
        </span>

        {state === "off" && (
          <button
            type="button"
            onClick={begin}
            disabled={busy}
            className="rounded-full bg-sky-strong px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-[#08607f] disabled:opacity-60"
          >
            {dict.mfaEnable ?? "Activer"}
          </button>
        )}
        {state === "on" && !disabling && (
          <button
            type="button"
            onClick={() => {
              setDisabling(true);
              setErr(null);
              setCode("");
            }}
            className="text-sm font-semibold text-muted hover:text-ink"
          >
            {dict.mfaDisable ?? "Désactiver"}
          </button>
        )}
      </div>

      {/* Enrôlement : QR (rendu local) + saisie manuelle en repli, puis confirmation par un 1er code */}
      {state === "enrolling" && (
        <div className="mt-4 rounded-xl border border-line bg-mist p-4">
          <p className="text-sm text-ink">
            {dict.mfaScan ?? "Scanne ce QR code avec ton application d'authentification (Google Authenticator, Authy…)."}
          </p>
          <div className="mt-3 flex flex-wrap items-start gap-5">
            <div className="rounded-lg bg-white p-3">
              <QRCodeSVG value={uri} size={148} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted">
                {dict.mfaManual ?? "Impossible de scanner ? Saisis cette clé à la main :"}
              </p>
              <p className="mt-1 break-all font-mono text-xs font-semibold text-heading">{secret}</p>
              <p className="mt-3 text-xs text-muted">
                {dict.mfaThenCode ?? "Saisis ensuite le code affiché par l'application :"}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {codeInput}
                <button
                  type="button"
                  onClick={confirm}
                  disabled={busy || code.trim().length < 6}
                  className="rounded-full bg-sky-strong px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy ? (dict.paySaving ?? "…") : (dict.mfaConfirm ?? "Confirmer")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setState("off");
                    setErr(null);
                  }}
                  className="text-sm text-muted hover:text-ink"
                >
                  {dict.payCancel ?? "Annuler"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Codes de secours — affichés UNE SEULE FOIS. C'est le seul moyen d'entrer si le téléphone est perdu. */}
      {state === "codes" && (
        <div className="mt-4 rounded-xl border border-warn-border bg-warn-bg p-4">
          <p className="text-sm font-semibold text-heading">
            {dict.mfaCodesTitle ?? "2FA activée. Conserve ces codes de secours."}
          </p>
          <p className="mt-1 text-sm text-warn-fg">
            {dict.mfaCodesWarn ??
              "Ils ne seront plus JAMAIS affichés. Ce sont les seuls moyens de te connecter si tu perds ton téléphone."}
          </p>
          <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 font-mono text-sm text-heading sm:grid-cols-3">
            {codes.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={copyCodes}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold text-heading"
            >
              {copied ? <Check size={14} className="text-ok-fg" /> : <Copy size={14} />}
              {copied ? (dict.mfaCopied ?? "Copiés") : (dict.mfaCopy ?? "Copier les codes")}
            </button>
            <button
              type="button"
              onClick={() => setState("on")}
              className="rounded-full bg-sky-strong px-5 py-2 text-sm font-semibold text-white"
            >
              {dict.mfaCodesDone ?? "J'ai noté ces codes"}
            </button>
          </div>
        </div>
      )}

      {/* Désactivation : un code VALIDE est exigé (une session détournée ne peut pas retirer la 2FA) */}
      {state === "on" && disabling && (
        <div className="mt-4 rounded-xl border border-line bg-mist p-4">
          <p className="text-sm text-ink">
            {dict.mfaDisableAsk ?? "Saisis un code de ton application (ou un code de secours) pour désactiver la 2FA."}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {codeInput}
            <button
              type="button"
              onClick={disable}
              disabled={busy || code.trim().length < 6}
              className="rounded-full border border-err-fg px-4 py-2 text-sm font-semibold text-err-fg disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? (dict.paySaving ?? "…") : (dict.mfaDisable ?? "Désactiver")}
            </button>
            <button
              type="button"
              onClick={() => {
                setDisabling(false);
                setErr(null);
              }}
              className="text-sm text-muted hover:text-ink"
            >
              {dict.payCancel ?? "Annuler"}
            </button>
          </div>
        </div>
      )}

      {err && <p className="mt-2 text-sm text-err-fg">{err}</p>}
    </div>
  );
}
