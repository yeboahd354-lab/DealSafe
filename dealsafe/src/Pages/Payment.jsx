import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, LockKeyhole, ShieldCheck, Smartphone } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { DashboardLayout } from "../Components/Dashboard";
import { auth, db } from "../firebase";

const normalizePhone = (value) => value.replace(/\D/g, "").replace(/^0/, "233");
const amountLabel = (value) => `GHS ${Number(value || 0).toLocaleString("en-GH", { minimumFractionDigits: 2 })}`;

function Payment() {
  const { transactionId } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [payer, setPayer] = useState("");
  const [channel, setChannel] = useState("13");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpRequired, setOtpRequired] = useState(false);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!auth.currentUser || !transactionId) return setLoading(false);
      const snapshot = await getDoc(doc(db, "deals", transactionId));
      if (snapshot.exists()) {
        const data = snapshot.data();
        const isBuyer = data.creatorRole === "buyer" ? data.creatorId === auth.currentUser.uid : data.acceptedBy === auth.currentUser.uid;
        if (isBuyer) { setTransaction({ documentId: snapshot.id, ...data, amountLabel: amountLabel(data.amount), name: data.title || "Untitled deal" }); setPayer(data.creatorRole === "buyer" ? data.otherParty?.phone || "" : ""); }
      }
      setLoading(false);
    };
    load().catch(() => { setError("We could not load this payment."); setLoading(false); });
  }, [transactionId]);

  const checkStatus = async (externalref) => {
    const response = await fetch("/.netlify/functions/moolre-payment", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "status", externalref }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || result.message || "Moolre status check failed.");
    const status = Number(result.data?.txstatus);
    if (status === 1) { await updateDoc(doc(db, "deals", transaction.documentId), { status: "payment_secured", paymentProvider: "moolre", paymentReference: externalref, paidBy: auth.currentUser.uid, paidAt: serverTimestamp() }); setPaid(true); setMessage("Payment confirmed by Moolre."); }
    else if (status === 2) setError("Moolre reported that this payment failed.");
    else setMessage("Payment is still pending. Approve the prompt on the phone, then check again.");
  };

  const startPayment = async (event) => {
    event.preventDefault(); setSubmitting(true); setError(""); setMessage("");
    const externalref = paymentReference || `DS-${transaction.id || transaction.documentId}-${Date.now()}`;
    const paymentPayload = { action: "initiate", payer: normalizePhone(payer), channel, amount: transaction.amount, externalref, reference: `DealSafe ${transaction.id || transaction.documentId}` };
    try {
      if (otpRequired) paymentPayload.otpcode = otpCode.trim();
      const response = await fetch("/.netlify/functions/moolre-payment", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(paymentPayload) });
      const result = await response.json();
      if (!response.ok || String(result.status) === "0") throw new Error(result.message || result.error || "Moolre could not start the payment.");
      setPaymentReference(externalref);
      if (result.code === "TP14" || result.code === "200_OTP_REQ") {
        setOtpRequired(true);
        setOtpCode("");
        setMessage("Moolre sent a verification code by SMS. Enter it below to continue.");
      } else if (result.code === "200_OTP_SUCCESS") {
        setOtpRequired(false);
        setOtpCode("");
        const promptResponse = await fetch("/.netlify/functions/moolre-payment", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...paymentPayload, otpcode: undefined }) });
        const promptResult = await promptResponse.json();
        if (!promptResponse.ok || String(promptResult.status) === "0") throw new Error(promptResult.message || promptResult.error || "Moolre could not start the payment.");
        setMessage("Verification complete. Approve the payment prompt on the payer's phone, then check payment status.");
      } else {
        setOtpRequired(false);
        setMessage("Payment prompt sent. Approve it on the payer's phone, then check payment status.");
      }
    } catch (paymentError) { setError(paymentError.message); } finally { setSubmitting(false); }
  };

  if (loading) return <DashboardLayout title="Make Payment"><div className="rounded-xl border border-[#e3ebe7] bg-white p-8 text-sm text-[#718580]">Loading payment details...</div></DashboardLayout>;
  if (!transaction) return <DashboardLayout title="Make Payment"><div className="rounded-xl border border-dashed border-[#cbdad4] bg-white p-10 text-center"><h2 className="font-display text-lg font-bold">Payment unavailable</h2><p className="mt-2 text-sm text-[#82938f]">This transaction is not available for your account.</p><Link className="mt-5 inline-flex text-xs font-bold text-[#0b776d]" to="/dashboard/transactions">Back to transactions</Link></div></DashboardLayout>;
  if (paid) return <DashboardLayout title="Payment Secured"><div className="mx-auto max-w-2xl py-8 text-center"><CheckCircle2 className="mx-auto text-[#0b776d]" size={48} /><h2 className="mt-5 font-display text-3xl font-bold">Payment secured</h2><p className="mt-3 text-sm text-[#718580]">Moolre confirmed your escrow payment for {transaction.name}.</p><Link className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#0b776d] px-5 py-3 text-xs font-bold text-white" to={`/dashboard/transactions/${transaction.documentId}`}>View transaction <ArrowRight size={15} /></Link></div></DashboardLayout>;
  return <DashboardLayout title="Make Payment"><div className="mx-auto max-w-xl"><Link className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-[#0b776d]" to={`/dashboard/transactions/${transactionId}`}><ArrowLeft size={15} /> Back to transaction</Link><section className="rounded-xl border border-[#e3ebe7] bg-white p-6 shadow-sm sm:p-8"><div className="flex items-start justify-between"><div><p className="text-[11px] uppercase tracking-[1.2px] text-[#0b776d]">Moolre escrow payment</p><h1 className="mt-2 font-display text-2xl font-bold">Pay {transaction.amountLabel}</h1><p className="mt-1 text-sm text-[#718580]">{transaction.name}</p></div><ShieldCheck className="text-[#0b776d]" size={25} /></div><form className="mt-7 grid gap-5" onSubmit={startPayment}><label className="grid gap-2 text-xs font-bold">Payer mobile money number<input className="h-11 rounded-lg border border-[#cbdad4] px-3 text-sm font-normal outline-none focus:border-[#0b776d]" value={payer} onChange={(event) => setPayer(event.target.value)} placeholder="024 123 4567" required /></label><label className="grid gap-2 text-xs font-bold">Network<select className="h-11 rounded-lg border border-[#cbdad4] px-3 text-sm outline-none focus:border-[#0b776d]" value={channel} onChange={(event) => setChannel(event.target.value)}><option value="13">MTN</option><option value="6">Telecel</option><option value="7">AT</option></select></label><label className="grid gap-2 rounded-lg border border-[#cbdad4] bg-[#f8fcfa] p-4 text-xs font-bold">SMS verification code <span className="font-normal text-[#718580]">{otpRequired ? "Moolre sent a code to the payer's phone. Enter it to continue." : "For first-time payers, enter the code Moolre sends by SMS after you request a prompt."}</span><input className="h-11 rounded-lg border border-[#cbdad4] bg-white px-3 text-sm font-normal tracking-[.3em] outline-none focus:border-[#0b776d]" inputMode="numeric" autoComplete="one-time-code" maxLength={8} value={otpCode} onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, ""))} placeholder="Optional until requested" required={otpRequired} /></label>{error && <p className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700" role="alert">{error}</p>}{message && <p className="rounded-lg bg-[#eff9f4] p-3 text-xs text-[#4f7169]" role="status">{message}</p>}<button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#0b776d] px-5 text-xs font-bold text-white disabled:opacity-50" type="submit" disabled={submitting || (otpRequired && !otpCode.trim())}>{submitting ? (otpRequired ? "Verifying code..." : "Sending payment prompt...") : otpRequired ? "Verify code and continue" : "Send payment prompt"} <Smartphone size={16} /></button></form>{paymentReference && <button type="button" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#bdcec8] px-5 py-3 text-xs font-bold text-[#0b776d]" onClick={() => checkStatus(paymentReference)}><LockKeyhole size={16} /> Check payment status</button>}</section></div></DashboardLayout>;
}
export default Payment;
