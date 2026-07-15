"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { apiAuthed } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";

type Dict = Record<string, string>;
type Invoice = { id: number; total: number; currency: string; status: string; outstanding: number };

/**
 * Retour du checkout HÉBERGÉ Flutterwave (mobile money). Le PSP renvoie sur le portail avec
 * `?status&tx_ref&transaction_id`, MAIS le règlement est confirmé par WEBHOOK côté serveur
 * (asynchrone). On ne fait donc PAS confiance au `status` de l'URL (manipulable — sinon on gonflerait
 * les `purchase` GA4 depuis une URL forgée) : on VÉRIFIE que la facture est réellement payée
 * (`my_invoices`) avant d'émettre `purchase`, avec un court polling car le webhook peut arriver APRÈS
 * le retour navigateur. Idempotent (sessionStorage) : jamais deux `purchase` pour la même transaction.
 *
 * NB déploiement : `payment_config.flutterwave.config_json.return_url` doit pointer vers cette page
 * portail (`<portail>/<lang>/account`) pour que ce retour soit capté.
 *
 * Le rail carte (Stripe) émet déjà `purchase` sur son `onPaid` synchrone — ceci comble l'angle mort
 * du rail mobile money, dont le règlement se conclut hors de la page.
 */
export function PaymentReturn({ dict, onSettled }: { dict: Dict; onSettled?: () => void }) {
  const [state, setState] = useState<"idle" | "checking" | "paid" | "pending" | "failed">("idle");

  useEffect(() => {
    const url = new URL(window.location.href);
    const txRef = url.searchParams.get("tx_ref");
    if (!txRef) return; // pas un retour PSP

    const status = (url.searchParams.get("status") || "").toLowerCase();
    const idMatch = /^inv-(\d+)-/.exec(txRef);
    const invoiceId = idMatch ? Number(idMatch[1]) : 0;

    // Retirer les paramètres de l'URL immédiatement (usage unique + anti-refire au refresh/partage).
    ["tx_ref", "status", "transaction_id", "resp"].forEach((k) => url.searchParams.delete(k));
    window.history.replaceState({}, "", url.toString());

    // Anti-double-émission (refresh, navigation arrière).
    const firedKey = `fw_purchase_${txRef}`;
    try {
      if (sessionStorage.getItem(firedKey)) {
        setState("paid");
        return;
      }
    } catch {
      /* storage indisponible — on continue, au pire on revérifie */
    }

    // Flutterwave annonce l'issue via `status` : annulé/échoué → inutile de vérifier la facture.
    if (status && status !== "successful" && status !== "completed") {
      setState("failed");
      return;
    }
    if (!invoiceId) {
      setState("idle");
      return;
    }

    setState("checking");
    let cancelled = false;
    let tries = 0;
    const MAX = 6; // ~15 s de fenêtre pour que le webhook solde la facture

    async function check() {
      if (cancelled) return;
      tries++;
      try {
        const res = await apiAuthed("my_invoices");
        const inv = ((res.data?.invoices as Invoice[]) ?? []).find((i) => i.id === invoiceId);
        if (inv && (inv.status === "paid" || inv.outstanding <= 0)) {
          try {
            sessionStorage.setItem(firedKey, "1");
          } catch {
            /* storage indisponible */
          }
          // `purchase` — UNIQUEMENT après confirmation SERVEUR (jamais sur le `status` de l'URL).
          trackEvent("purchase", { transaction_id: txRef, value: inv.total, currency: inv.currency });
          setState("paid");
          onSettled?.();
          return;
        }
      } catch {
        /* réseau : on retente */
      }
      if (tries >= MAX) {
        setState("pending"); // le webhook finira par solder ; la liste des factures le reflétera
        return;
      }
      setTimeout(check, 2500);
    }
    check();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state === "idle") return null;

  const box = "mb-2 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm";
  if (state === "checking") {
    return (
      <div className={`${box} border-line bg-info-bg text-info-fg`} role="status">
        <Clock size={18} className="flex-none animate-pulse" />
        {dict.payReturnChecking ?? "Confirmation de votre paiement en cours…"}
      </div>
    );
  }
  if (state === "paid") {
    return (
      <div className={`${box} border-ok-border bg-ok-bg text-ok-fg`} role="status">
        <CheckCircle2 size={18} className="flex-none" />
        {dict.payReturnPaid ?? "Paiement confirmé. Merci !"}
      </div>
    );
  }
  if (state === "pending") {
    return (
      <div className={`${box} border-warn-border bg-warn-bg text-warn-fg`} role="status">
        <Clock size={18} className="flex-none" />
        {dict.payReturnPending ??
          "Paiement reçu — la confirmation peut prendre quelques minutes. Vos factures se mettront à jour."}
      </div>
    );
  }
  return (
    <div className={`${box} border-err-border bg-err-bg text-err-fg`} role="alert">
      <XCircle size={18} className="flex-none" />
      {dict.payReturnFailed ?? "Le paiement n'a pas abouti. Vous pouvez réessayer depuis vos factures."}
    </div>
  );
}
