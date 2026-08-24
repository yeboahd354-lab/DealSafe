import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="grid min-h-screen bg-[#f7f9f4] lg:grid-cols-[minmax(280px,.85fr)_1.15fr]">
      <section className="flex min-h-[205px] flex-col justify-between bg-[#0e3d3c] px-5 py-6 text-white lg:min-h-screen lg:px-[clamp(28px,6vw,90px)] lg:py-10">
        <a className="inline-flex items-center gap-2 font-display text-xl font-bold text-white" href="/" aria-label="DealSafe home"><span className="grid h-8 w-8 place-items-center rounded-[10px_10px_10px_2px] bg-[#0b776d]"><ShieldCheck size={19} /></span><span>Deal<span className="text-[#18b394]">Safe</span></span></a>
        <div className="my-9 max-w-[420px] lg:my-auto"><p className="mb-3 text-[11px] font-bold uppercase tracking-[1.3px] text-[#9bdec1]">Welcome back</p><h1 className="mb-[18px] font-display text-[31px] font-bold leading-tight tracking-[-1px] lg:text-[clamp(36px,4vw,58px)] lg:tracking-[-2px]">Keep every online deal protected.</h1><p className="hidden max-w-[360px] leading-7 text-[#b9d7ce] lg:block">Sign in to manage your transactions, track deliveries and keep your payment flow clear.</p></div>
        <div className="hidden items-center gap-2 text-xs text-[#b9d7ce] lg:flex"><LockKeyhole size={17} /> Your transaction details stay protected.</div>
      </section>
      <section className="flex min-h-[calc(100vh-205px)] justify-center bg-white px-5 pb-9 pt-8 lg:min-h-screen lg:px-[clamp(28px,6vw,90px)] lg:py-10">
        <div className="my-auto w-full max-w-[440px]"><p className="mb-3 text-[11px] font-bold uppercase tracking-[1.3px] text-[#0b776d]">Account access</p><h2 className="font-display text-[31px] font-bold leading-tight tracking-[-1.4px] lg:text-4xl">Log in to your account</h2><p className="mb-6 mt-3 text-sm text-[#637777] lg:mb-8">Welcome back. Enter your details to continue.</p>
          <form className="grid gap-2" onSubmit={async (event) => { event.preventDefault(); setError(""); setLoading(true); try { await signInWithEmailAndPassword(auth, formData.email, formData.password); navigate("/dashboard"); } catch (firebaseError) { const messages = { "auth/invalid-credential": "The email or password is incorrect.", "auth/user-not-found": "The email or password is incorrect.", "auth/wrong-password": "The email or password is incorrect.", "auth/invalid-email": "Enter a valid email address.", "auth/too-many-requests": "Too many attempts. Please try again later." }; setError(messages[firebaseError.code] || "We could not sign you in. Please try again."); } finally { setLoading(false); } }}>
            <label className="text-xs font-bold" htmlFor="login-email">Email address</label><input className="mb-2 h-[46px] w-full rounded-[7px] border border-[#cbdad4] bg-[#fbfdfb] px-[13px] text-[13px] outline-none focus:border-[#0b776d] focus:ring-4 focus:ring-[#0b776d1a]" id="login-email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} />
            <div className="flex items-center justify-between"><label className="text-xs font-bold" htmlFor="login-password">Password</label><a className="text-[11px] font-bold text-[#0b776d]" href="#forgot-password">Forgot password?</a></div>
            <div className="relative"><input className="mb-2 h-[46px] w-full rounded-[7px] border border-[#cbdad4] bg-[#fbfdfb] px-[13px] pr-[45px] text-[13px] outline-none focus:border-[#0b776d] focus:ring-4 focus:ring-[#0b776d1a]" id="login-password" name="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" autoComplete="current-password" required value={formData.password} onChange={(event) => setFormData({ ...formData, password: event.target.value })} /><button className="absolute right-0 top-0 grid h-[46px] w-11 place-items-center border-0 bg-transparent text-[#718984]" type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
            {error && <p className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700" role="alert">{error}</p>}
            <button className="mt-2 h-12 rounded-[7px] border-0 bg-[#0b776d] text-[13px] font-bold text-white transition hover:bg-[#095c55] disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={loading}>{loading ? "Signing in..." : "Log in"}</button>
          </form><p className="mt-6 text-center text-xs text-[#637777]">Don't have an account? <a className="font-bold text-[#0b776d]" href="/signup">Create one</a></p>
        </div>
      </section>
    </div>
  );
}

export default Login;
