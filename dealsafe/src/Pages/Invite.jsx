import { useEffect, useState } from "react";
import { CheckCircle2, CircleAlert, ShieldCheck } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

function amount(value) { return `GHS ${Number(value || 0).toLocaleString("en-GH", { minimumFractionDigits: 2 })}`; }

function Invite() {
  const { transactionCode } = useParams();
  const navigate = useNavigate();
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    getDoc(doc(db, "invitations", transactionCode))
      .then((result) => {
        if (!active) return;
        if (!result.exists()) setError("This invitation could not be found or has expired.");
        else setDeal({ ...result.data(), documentId: result.data().dealId });
      })
      .catch(() => active && setError("We could not load this invitation. Please try again."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [transactionCode]);
  const accept = async () => {
    if (auth.currentUser) {
      await updateDoc(doc(db, "deals", deal.documentId), { invitationAccepted: true, acceptedBy: auth.currentUser.uid, status: "waiting_for_payment" });
      await updateDoc(doc(db, "invitations", transactionCode), { acceptedBy: auth.currentUser.uid, acceptedAt: serverTimestamp(), status: "accepted" });
      await addDoc(collection(db, "notifications"), { userId: deal.creatorId, transactionCode, type: "accepted", title: "Invitation accepted", message: `${auth.currentUser.displayName || "The other party"} accepted your deal. The buyer can now pay to escrow.`, read: false, createdAt: serverTimestamp() });
      navigate(`/dashboard/transactions/${deal.documentId}`);
    }
    else navigate(`/signup?invite=${encodeURIComponent(transactionCode)}`);
  };
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f9f4] px-5 py-10 text-[#173b3a]">
      <div className="w-full max-w-2xl rounded-xl border border-[#dce7e2] bg-white p-6 shadow-[0_8px_30px_rgba(16,42,42,.06)] sm:p-10">
        <Link className="inline-flex items-center gap-2 font-display text-xl font-bold" to="/"><span className="grid h-8 w-8 place-items-center rounded-[10px_10px_10px_2px] bg-[#0b776d] text-white"><ShieldCheck size={19} /></span>Deal<span className="text-[#18b394]">Safe</span></Link>
        {loading && <p className="mt-10 text-sm text-[#718580]">Loading invitation...</p>}
        {!loading && error && <div className="mt-10 rounded-lg bg-rose-50 p-4 text-sm text-rose-700"><CircleAlert className="mb-2" size={20} />{error}</div>}
        {!loading && deal && <>
          <p className="mt-10 text-[11px] font-bold uppercase tracking-[1.2px] text-[#0b776d]">DealSafe invitation</p>
          <h1 className="mt-2 font-display text-3xl font-bold">Review this deal</h1>
          <p className="mt-2 text-sm text-[#718580]">You have been invited to review the agreement below. Accepting does not charge you.</p>
          <div className="mt-7 grid gap-4 rounded-xl border border-[#dce7e2] bg-[#f7fbf8] p-5 text-sm sm:grid-cols-2">
            <div><p className="text-xs text-[#849691]">Deal</p><strong className="mt-1 block">{deal.title}</strong></div>
            <div><p className="text-xs text-[#849691]">Amount</p><strong className="mt-1 block">{amount(deal.amount)}</strong></div>
            <div><p className="text-xs text-[#849691]">From</p><strong className="mt-1 block">{deal.otherParty?.fullName || "DealSafe user"}</strong></div>
            <div><p className="text-xs text-[#849691]">Transaction</p><strong className="mt-1 block">{deal.transactionCode}</strong></div>
          </div>
          <div className="mt-5 rounded-lg border border-[#bfdfd0] bg-[#eff9f4] p-4 text-sm leading-6 text-[#58766e]">{deal.description}</div>
          <div className="mt-5 whitespace-pre-line rounded-lg border border-[#e1ebe6] p-4 text-sm leading-6"><p className="mb-2 text-xs font-bold text-[#849691]">Agreed terms</p>{deal.terms || "No additional terms provided."}</div>
          <button className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[#0b776d] px-5 py-3 text-xs font-bold text-white" type="button" onClick={accept}>{auth.currentUser ? "Open transaction" : "Accept and sign up"} <CheckCircle2 size={16} /></button>
        </>}
      </div>
    </main>
  );
}

export default Invite;