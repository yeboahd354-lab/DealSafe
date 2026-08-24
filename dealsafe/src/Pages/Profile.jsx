import { useEffect, useState } from "react";
import { CheckCircle2, Mail, Phone, Save, ShieldCheck, UserRound } from "lucide-react";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { DashboardLayout } from "../Components/Dashboard";
import { auth, db } from "../firebase";

function Profile() {
  const [profile, setProfile] = useState({ fullName: "", email: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!auth.currentUser) { setLoading(false); return undefined; }
    const unsubscribe = onSnapshot(doc(db, "users", auth.currentUser.uid), (snapshot) => {
      const data = snapshot.data() || {};
      setProfile({ fullName: data.fullName || auth.currentUser.displayName || "", email: data.email || auth.currentUser.email || "", phone: data.phone || "" });
      setLoading(false);
    }, () => { setError("We could not load your profile details."); setLoading(false); });
    return unsubscribe;
  }, []);

  const saveProfile = async () => {
    if (!auth.currentUser) return;
    setError(""); setSaved(false);
    try { await setDoc(doc(db, "users", auth.currentUser.uid), { uid: auth.currentUser.uid, ...profile, updatedAt: serverTimestamp() }, { merge: true }); setSaved(true); }
    catch { setError("We could not save your profile changes."); }
  };

  if (loading) return <DashboardLayout title="Profile"><div className="mx-auto max-w-4xl rounded-xl border border-[#e3ebe7] bg-white p-8 text-sm text-[#718580]">Loading your profile...</div></DashboardLayout>;
  return <DashboardLayout title="Profile"><div className="mx-auto max-w-4xl"><div className="mb-8"><p className="text-[11px] font-bold uppercase tracking-[1.2px] text-[#0b776d]">Personal details</p><h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">Profile</h2><p className="mt-2 text-sm text-[#718580]">Keep your contact details current so buyers and sellers can reach you.</p></div>{error && <p className="mb-5 rounded-lg bg-rose-50 p-3 text-xs text-rose-700" role="alert">{error}</p>}{saved && <p className="mb-5 flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-xs font-semibold text-emerald-700"><CheckCircle2 size={15} /> Profile changes saved.</p>}<section className="rounded-xl border border-[#e3ebe7] bg-white p-5 shadow-sm sm:p-7"><div className="flex flex-col gap-5 border-b border-[#edf1ef] pb-6 sm:flex-row sm:items-center"><div className="grid h-16 w-16 place-items-center rounded-full bg-[#d8eee4] font-display text-lg font-bold text-[#0b776d]">{(profile.fullName || "U").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</div><h3 className="font-display text-lg font-bold">{profile.fullName || "DealSafe user"}</h3><span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700 sm:ml-auto"><CheckCircle2 size={14} /> Profile active</span></div><div className="mt-7 grid gap-5 sm:grid-cols-2"><label className="grid gap-2 text-xs font-bold">Full name<div className="relative"><UserRound className="absolute left-3 top-3 text-[#8da29d]" size={16} /><input className="h-11 w-full rounded-lg border border-[#cbdad4] bg-[#fbfdfb] pl-10 pr-3 text-sm font-normal outline-none focus:border-[#0b776d]" value={profile.fullName} onChange={(event) => setProfile({ ...profile, fullName: event.target.value })} /></div></label><label className="grid gap-2 text-xs font-bold">Email address<div className="relative"><Mail className="absolute left-3 top-3 text-[#8da29d]" size={16} /><input className="h-11 w-full rounded-lg border border-[#cbdad4] bg-[#fbfdfb] pl-10 pr-3 text-sm font-normal outline-none focus:border-[#0b776d]" type="email" value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} /></div></label><label className="grid gap-2 text-xs font-bold">Phone number<div className="relative"><Phone className="absolute left-3 top-3 text-[#8da29d]" size={16} /><input className="h-11 w-full rounded-lg border border-[#cbdad4] bg-[#fbfdfb] pl-10 pr-3 text-sm font-normal outline-none focus:border-[#0b776d]" type="tel" value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} /></div></label></div><button type="button" onClick={saveProfile} className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#0b776d] px-5 text-xs font-bold text-white hover:bg-[#095c55]"><Save size={15} /> Save changes</button></section><section className="mt-6 rounded-xl border border-[#bfdfd0] bg-[#eff9f4] p-5"><div className="flex gap-3"><ShieldCheck className="shrink-0 text-[#0b776d]" size={20} /><div><h3 className="text-sm font-bold">Your profile supports safer deals</h3><p className="mt-1 text-xs leading-5 text-[#58766e]">Accurate contact details help the other party identify your transaction and receive important DealSafe updates.</p></div></div></section></div></DashboardLayout>;
}

export default Profile;
