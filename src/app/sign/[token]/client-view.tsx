"use client";

import { useState } from "react";
import { CheckCircle2, ShieldCheck, FileCheck, AlertCircle } from "lucide-react";

interface Props {
  token: string;
  quoteData: any;
}

export function SigningClientView({ token, quoteData }: Props) {
  const { quote, version } = quoteData;
  const isAlreadySigned = version.status === "נחתמה";

  const [signerName, setSignerName] = useState(version.signerName || version.party?.name || "");
  const [signerIdNumber, setSignerIdNumber] = useState(version.signerIdNumber || version.party?.vatNumber || "");
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signedSuccess, setSignedSuccess] = useState(isAlreadySigned);

  const handleSign = async () => {
    if (!signerName || !signerIdNumber) {
      alert("נא למלא שם מלא ומספר ת.ז / ח.פ");
      return;
    }
    if (!agreed) {
      alert("נא לאשר את תנאי ההצעה וההתקשרות");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          signerName,
          signerIdNumber,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSignedSuccess(true);
      } else {
        alert("שגיאה בחתימה: " + data.error);
      }
    } catch (e: any) {
      alert("שגיאת רשת: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 my-8 pb-12">
      {/* Brand Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center font-black text-slate-950 text-2xl shadow-lg">
              B
            </div>
            <div>
              <h1 className="font-extrabold text-xl text-white tracking-wide">
                BIST PRODUCTIONS
              </h1>
              <p className="text-xs text-amber-400 font-medium">סטודיו והפקות תוכן מקצועיות</p>
            </div>
          </div>

          <div className="text-left font-mono">
            <span className="text-xs text-slate-400 block">מספר הצעה</span>
            <span className="text-base font-bold text-white">{quote?.quoteNumber || "Q-1000"}</span>
          </div>
        </div>

        {/* Customer & Quote Summary Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-1.5">
            <span className="text-slate-400 font-semibold block">לכבוד:</span>
            <p className="text-white font-bold text-sm">{version.party?.name}</p>
            {version.party?.companyName && (
              <p className="text-slate-300">{version.party.companyName}</p>
            )}
            {version.party?.phone && (
              <p className="text-slate-400 font-mono">טלפון: {version.party.phone}</p>
            )}
            {version.party?.vatNumber && (
              <p className="text-slate-400 font-mono">ח.פ / ע.מ: {version.party.vatNumber}</p>
            )}
          </div>

          <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-1.5">
            <span className="text-slate-400 font-semibold block">פרטי ההתקשרות:</span>
            <p className="text-slate-300">
              תוקף ההצעה: <strong>{version.terms?.validityDays || 14} ימים</strong>
            </p>
            <p className="text-slate-300">
              תנאי תשלום: <strong>{version.terms?.paymentTerms || "לפי סיכום"}</strong>
            </p>
            <p className="text-slate-300">
              תשלומים: <strong>{version.terms?.installmentsCount || 1} תשלומים</strong>
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-white">פירוט המוצרים והתוצרים הכלולים:</h2>
          <div className="bg-slate-950/80 rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                  <th className="py-3 px-4">פריט / חבילה</th>
                  <th className="py-3 px-4 text-center">כמות</th>
                  <th className="py-3 px-4 text-left">מחיר שורה</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {version.items?.map((item: any) => (
                  <tr key={item.cartId || item.id}>
                    <td className="py-3 px-4">
                      <p className="font-bold text-white">{item.name}</p>
                      {item.notes?.clientNotes && (
                        <p className="text-[11px] text-slate-400 mt-0.5">{item.notes.clientNotes}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-300">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-4 text-left font-mono font-bold text-white">
                      ₪{(item.quantity * item.unitPrice).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Terms and Delivery Notes (Client Facing Only) */}
        {(version.clientNotes || version.deliveryTerms) && (
          <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3 text-xs">
            {version.clientNotes && (
              <div>
                <strong className="text-amber-400 block mb-1">הערות כלליות להצעה:</strong>
                <p className="text-slate-300 leading-relaxed">{version.clientNotes}</p>
              </div>
            )}
            {version.deliveryTerms && (
              <div>
                <strong className="text-purple-400 block mb-1">תנאי אספקה ולוחות זמנים:</strong>
                <p className="text-slate-300 leading-relaxed">{version.deliveryTerms}</p>
              </div>
            )}
          </div>
        )}

        {/* Financial Summary */}
        <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span>סכום ביניים:</span>
            <span className="font-mono">₪{version.totals?.subtotal?.toLocaleString()}</span>
          </div>

          {version.totals?.discountAmount > 0 && (
            <div className="flex items-center justify-between text-rose-400">
              <span>הנחה ({version.totals?.discountPercent}%):</span>
              <span className="font-mono">- ₪{version.totals?.discountAmount?.toLocaleString()}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-slate-400">
            <span>מע״מ (18%):</span>
            <span className="font-mono">₪{version.totals?.vatAmount?.toLocaleString()}</span>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-base">
            <strong className="text-white">סה״כ לתשלום כולל מע״מ:</strong>
            <strong className="text-amber-400 font-mono text-xl">
              ₪{version.totals?.totalWithVat?.toLocaleString()}
            </strong>
          </div>

          {version.totals?.advancePaymentAmount > 0 && (
            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-purple-300">
              <span>מקדמה נדרשת להזמנה:</span>
              <span className="font-bold font-mono">
                ₪{version.totals?.advancePaymentAmount?.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Signature Box */}
        {signedSuccess ? (
          <div className="p-6 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="font-bold text-white text-base">ההצעה נחתמה ואושרה בהצלחה!</h3>
            <p className="text-xs text-slate-300">
              החתימה נקלטה במערכת ההפקות של סטודיו BIST. פרטי ההפקה הועברו לצוות לתחילת עבודה.
            </p>
            <p className="text-[11px] text-emerald-400 font-mono mt-2">
              נחתם ע״י {signerName} ({signerIdNumber})
            </p>
          </div>
        ) : (
          <div className="p-6 bg-slate-950/80 border border-amber-500/30 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 text-amber-400 text-sm font-bold">
              <ShieldCheck className="w-5 h-5" />
              <span>חתימה דיגיטלית ואישור ההצעה</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 font-semibold mb-1">
                  שם מלא של המורשה לחתום
                </label>
                <input
                  type="text"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  placeholder="שם מלא"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 font-semibold mb-1">
                  מספר ת.ז / ח.פ של החותם
                </label>
                <input
                  type="text"
                  value={signerIdNumber}
                  onChange={(e) => setSignerIdNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  placeholder="מספר מזהה"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 text-xs text-slate-300 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 accent-amber-400 rounded"
              />
              <span>
                קראתי ואני מאשר את תנאי ההצעה, לוחות הזמנים וכמות סבבי התיקונים המוגדרים במסמך זה.
              </span>
            </label>

            <button
              onClick={handleSign}
              disabled={isSubmitting || !agreed}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition disabled:opacity-50"
            >
              {isSubmitting ? "מאמת חתימה..." : "אשר וחתום דיגיטלית על ההצעה"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
