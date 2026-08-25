import { useState } from "react";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { addDoc, collection, doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { useNavigate, useSearchParams } from "react-router-dom";
import { auth, db } from "../firebase";

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", email: "", phone: "", password: "", confirmPassword: "", terms: false });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get("invite");

  const inputClass = "mb-2 h-[46px] w-full rounded-[7px] border border-[#cbdad4] bg-[#fbfdfb] px-[13px] text-[13px] outline-none focus:border-[#0b776d] focus:ring-4 focus:ring-[#0b776d1a]";
  const labelClass = "text-xs font-bold";

  return (
    <div className="grid min-h-screen bg-[#f7f9f4] lg:grid-cols-[minmax(280px,.85fr)_1.15fr]">
      <section className="flex min-h-[205px] flex-col justify-between bg-[#0e3d3c] px-5 py-6 text-white lg:min-h-screen lg:px-[clamp(28px,6vw,90px)] lg:py-10">
        <a className="inline-flex items-center gap-2 font-display text-xl font-bold text-white" href="/" aria-label="DealSafe home"><span className="grid h-8 w-8 place-items-center rounded-[10px_10px_10px_2px] bg-[#0b776d]"><ShieldCheck size={19} /></span><span>Deal<span className="text-[#18b394]">Safe</span></span></a>
        <div className="my-9 max-w-[420px] lg:my-auto"><p className="mb-3 text-[11px] font-bold uppercase tracking-[1.3px] text-[#9bdec1]">Start safer</p><h1 className="font-display text-[31px] font-bold leading-tight tracking-[-1px] lg:text-[clamp(36px,4vw,58px)] lg:tracking-[-2px]">Make your next online deal a DealSafe deal.</h1><p className="mt-[18px] hidden max-w-[360px] leading-7 text-[#b9d7ce] lg:block">Create an account to invite sellers, secure payments and keep a clear record of every transaction.</p></div>
      </section>
      <section className="flex min-h-[calc(100vh-205px)] justify-center bg-white px-5 pb-9 pt-8 lg:min-h-screen lg:px-[clamp(28px,6vw,90px)] lg:py-10">
        <div className="my-auto w-full max-w-[440px]"><p className="mb-3 text-[11px] font-bold uppercase tracking-[1.3px] text-[#0b776d]">Create your account</p><h2 className="font-display text-[31px] font-bold leading-tight tracking-[-1.4px] lg:text-4xl">Join DealSafe</h2><p className="mb-6 mt-3 text-sm text-[#637777] lg:mb-8">Set up your account in a few seconds.</p>
          <form className="grid gap-2" onSubmit={async (event) => { event.preventDefault(); setError(""); if (formData.password !== formData.confirmPassword) { setError("Passwords do not match."); return; } setLoading(true); try { const credential = await createUserWithEmailAndPassword(auth, formData.email, formData.password); await updateProfile(credential.user, { displayName: formData.fullName }); await setDoc(doc(db, "users", credential.user.uid), { uid: credential.user.uid, fullName: formData.fullName, email: formData.email, phone: formData.phone, createdAt: serverTimestamp() }); if (inviteCode) { const invitation = await getDoc(doc(db, "invitations", inviteCode)); if (invitation.exists()) { await updateDoc(doc(db, "deals", invitation.data().dealId), { invitationAccepted: true, acceptedBy: credential.user.uid, status: "waiting_for_payment" }); await updateDoc(doc(db, "invitations", inviteCode), { acceptedBy: credential.user.uid, acceptedAt: serverTimestamp(), status: "accepted" }); await addDoc(collection(db, "notifications"), { userId: invitation.data().creatorId, transactionCode: inviteCode, type: "accepted", title: "Invitation accepted", message: `${formData.fullName} accepted your deal. The buyer can now pay to escrow.`, read: false, createdAt: serverTimestamp() }); } } navigate(inviteCode ? `/invite/${encodeURIComponent(inviteCode)}` : "/dashboard"); } catch (firebaseError) { const messages = { "auth/email-already-in-use": "An account already exists with this email.", "auth/invalid-email": "Enter a valid email address.", "auth/weak-password": "Choose a stronger password with at least 6 characters." }; setError(messages[firebaseError.code] || "We could not create your account. Please try again."); } finally { setLoading(false); } }}>
            <label className={labelClass} htmlFor="signup-name">Full name</label><input className={inputClass} id="signup-name" name="fullName" type="text" placeholder="Your full name" autoComplete="name" required value={formData.fullName} onChange={(event) => setFormData({ ...formData, fullName: event.target.value })} />
            <label className={labelClass} htmlFor="signup-email">Email address</label><input className={inputClass} id="signup-email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} />
            <label className={labelClass} htmlFor="signup-phone">Phone number</label><input className={inputClass} id="signup-phone" name="phone" type="tel" placeholder="+233 20 000 0000" autoComplete="tel" required value={formData.phone} onChange={(event) => setFormData({ ...formData, phone: event.target.value })} />
            <label className={labelClass} htmlFor="signup-password">Password</label><div className="relative"><input className={`${inputClass} pr-[45px]`} id="signup-password" name="password" type={showPassword ? "text" : "password"} placeholder="Create a password" autoComplete="new-password" required value={formData.password} onChange={(event) => setFormData({ ...formData, password: event.target.value })} /><button className="absolute right-0 top-0 grid h-[46px] w-11 place-items-center border-0 bg-transparent text-[#718984]" type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
            <label className={labelClass} htmlFor="signup-confirm-password">Confirm password</label><div className="relative"><input className={`${inputClass} pr-[45px]`} id="signup-confirm-password" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Repeat your password" autoComplete="new-password" required value={formData.confirmPassword} onChange={(event) => setFormData({ ...formData, confirmPassword: event.target.value })} /><button className="absolute right-0 top-0 grid h-[46px] w-11 place-items-center border-0 bg-transparent text-[#718984]" type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label={showConfirmPassword ? "Hide password" : "Show password"}>{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
            <label className="mt-1 flex items-start gap-2 text-[11px] leading-5 text-[#637777]"><input className="mt-0 h-4 w-4 shrink-0 accent-[#0b776d]" type="checkbox" name="terms" required checked={formData.terms} onChange={(event) => setFormData({ ...formData, terms: event.target.checked })} /><span>I agree to the <a className="font-bold text-[#0b776d]" href="#terms">Terms of Service</a> and <a className="font-bold text-[#0b776d]" href="#privacy">Privacy Policy</a>.</span></label>
            {error && <p className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700" role="alert">{error}</p>}
            <button className="mt-2 h-12 rounded-[7px] border-0 bg-[#0b776d] text-[13px] font-bold text-white transition hover:bg-[#095c55] disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={loading}>{loading ? "Creating account..." : inviteCode ? "Create account and accept" : "Create account"}</button>
          </form><p className="mt-6 text-center text-xs text-[#637777]">Already have an account? <a className="font-bold text-[#0b776d]" href="/login">Log in</a></p>
        </div>
      </section>
    </div>
  );
}

export default Signup;
