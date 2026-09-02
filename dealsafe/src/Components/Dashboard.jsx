import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  LockKeyhole,
  LogOut,
  Menu,
  PackageCheck,
  Plus,
  Scale,
  Search,
  ShieldAlert,
  Settings,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { collection, doc, getDoc, onSnapshot, query, where } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";

const navItems = [
  ["Dashboard", "/dashboard", LayoutDashboard],
  ["Create Deal", "/dashboard/create-deal", Plus],
  ["Transactions", "/dashboard/transactions", ListChecks],
  ["Disputes", "/dashboard/disputes", Scale],
  ["Notifications", "/dashboard/notifications", Bell],
  ["Payout Settings", "/dashboard/payout-settings", Settings],
  ["Profile", "/dashboard/profile", UserRound],
];
const routeTitles = {
  "/dashboard": "Dashboard",
  "/dashboard/create-deal": "Create Deal",
  "/dashboard/transactions": "Transactions",
  "/dashboard/disputes": "Disputes",
  "/dashboard/notifications": "Notifications",
  "/dashboard/payout-settings": "Payout Settings",
  "/dashboard/profile": "Profile",
  "/dashboard/help": "Help & Support",
};
const stages = [
  "Deal Created",
  "Seller Accepted",
  "Payment Secured",
  "Awaiting Delivery",
  "Buyer Confirmation",
  "Payment Release",
];

function Logo() {
  return (
    <Link
      to="/dashboard"
      className="flex items-center gap-2 font-display text-xl font-bold text-[#102a2a]"
    >
      <span className="grid h-8 w-8 place-items-center rounded-[10px_10px_10px_2px] bg-[#0b776d] text-white">
        <ShieldCheck size={19} />
      </span>
      <span>
        Deal<span className="text-[#0b776d]">Safe</span>
      </span>
    </Link>
  );
}
function StatusBadge({ status }) {
  const styles = {
    Completed: "bg-emerald-50 text-emerald-700",
    "Awaiting Delivery": "bg-amber-50 text-amber-700",
    "Payment Secured": "bg-sky-50 text-sky-700",
    Disputed: "bg-rose-50 text-rose-700",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${styles[status] || "bg-slate-100 text-slate-600"}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
function Sidebar({ mobile = false, onClose }) {
  const isAdmin = auth.currentUser?.email?.toLowerCase() === "yeboahd10@gmail.com";
  const visibleNavItems = isAdmin ? [...navItems, ["Admin", "/dashboard/admin", ShieldAlert]] : navItems;
  return (
    <aside
      className={`${mobile ? "fixed inset-y-0 left-0 z-30 w-[280px] shadow-2xl" : "hidden w-[252px] shrink-0 border-r border-[#e4ebe8] lg:flex"} flex-col bg-white px-5 py-6`}
    >
      <div className="flex items-center justify-between">
        <Logo />
        {mobile && (
          <button
            className="text-slate-500"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        )}
      </div>
      <nav className="mt-10 grid gap-1">
        {visibleNavItems.map(([label, href, Icon]) => (
          <NavLink
            end={href === "/dashboard"}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-semibold transition ${isActive ? "bg-[#e5f3ed] text-[#0b776d]" : "text-[#657975] hover:bg-[#f3f7f5] hover:text-[#102a2a]"}`
            }
            to={href}
            key={label}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto grid gap-1 border-t border-[#e4ebe8] pt-5">
        <NavLink
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-semibold text-[#657975] hover:bg-[#f3f7f5]"
          to="/dashboard/help"
        >
          <LifeBuoy size={17} />
          Help & Support
        </NavLink>
        <button
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-semibold text-[#657975] hover:bg-[#f3f7f5]"
          type="button"
          onClick={() => signOut(auth)}
        >
          <LogOut size={17} />
          Log Out
        </button>
      </div>
    </aside>
  );
}
function DashboardNavbar({ onMenu, user }) {
  const displayName = user?.displayName || user?.email || "DealSafe user";
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  useEffect(() => {
    if (!user?.uid) {
      setUnreadNotifications(0);
      return undefined;
    }
    const unsubscribe = onSnapshot(
      query(collection(db, "notifications"), where("userId", "==", user.uid)),
      (snapshot) => setUnreadNotifications(snapshot.docs.filter((item) => item.data().read !== true).length),
      () => setUnreadNotifications(0),
    );
    return unsubscribe;
  }, [user?.uid]);
  return (
    <header className="flex h-[76px] items-center justify-between border-b border-[#e4ebe8] bg-white px-5 sm:px-8">
      <div className="flex items-center gap-3">
        <button
          className="text-[#486762] lg:hidden"
          onClick={onMenu}
          aria-label="Open navigation"
        >
          <Menu size={22} />
        </button>
        <Logo />
      </div>
      <div className="flex items-center gap-4">
        <Link
          to="/dashboard/notifications"
          className="relative rounded-lg p-2 text-[#627a75] hover:bg-[#f1f6f3]"
          aria-label="Notifications"
        >
          <Bell size={19} />
          {unreadNotifications > 0 && (
            <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-[#e39b2e] px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
              {unreadNotifications > 99 ? "99+" : unreadNotifications}
            </span>
          )}
        </Link>
        <div className="hidden items-center gap-2 border-l border-[#e4ebe8] pl-4 sm:flex">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#d8eee4] text-[11px] font-bold text-[#0b776d]">
            {displayName.slice(0, 2).toUpperCase()}
          </span>
          <span className="text-[13px] font-bold">{displayName}</span>
          <ChevronDown size={15} className="text-slate-400" />
        </div>
      </div>
    </header>
  );
}
function StatCard({ icon: Icon, label, value, detail, tone }) {
  return (
    <div className="group rounded-xl border border-[#e3ebe7] bg-white p-5 shadow-[0_3px_12px_rgba(16,42,42,.03)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(16,42,42,.08)]">
      <div className="flex items-start justify-between">
        <span className={`grid h-9 w-9 place-items-center rounded-lg ${tone}`}>
          <Icon size={18} />
        </span>
        <ArrowRight
          size={16}
          className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#0b776d]"
        />
      </div>
      <p className="mt-4 text-[12px] font-semibold text-[#718580]">{label}</p>
      <strong className="mt-1 block font-display text-2xl text-[#102a2a]">
        {value}
      </strong>
      <p className="mt-1 text-[11px] text-[#91a29e]">{detail}</p>
    </div>
  );
}
function AttentionTransaction({ transaction }) {
  if (!transaction) return <div className="rounded-xl border border-dashed border-[#cbdad4] bg-white p-8 text-center text-sm text-[#82938f]">No active transaction needs your attention.</div>;
  const attentionMessages = {
    "Waiting for Payment": <>Your <strong>{transaction.amount} payment is ready.</strong> Review the deal and proceed to payment when you are ready.</>,
    "Awaiting Delivery": <>Your <strong>{transaction.amount} payment has been secured.</strong> Wait for the seller to deliver before confirming this transaction.</>,
    "Payment Secured": <>Your <strong>{transaction.amount} payment is secured.</strong> The seller can now proceed with delivery.</>,
  };
  const completedStages = { "Waiting for Seller": 1, "Waiting for Buyer": 1, "Waiting for Payment": 2, "Payment Secured": 3, "Awaiting Delivery": 3, "Awaiting Confirmation": 4, "Ready for Release": 5, Completed: 6 };
  const completedCount = completedStages[transaction.status] ?? 0;
  return (
    <section className="rounded-xl border border-[#dfeae4] bg-white p-5 shadow-[0_3px_12px_rgba(16,42,42,.03)] sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#e4a029]" />
            <p className="text-[11px] font-bold uppercase tracking-[1.2px] text-[#9a8a62]">
              Needs your attention
            </p>
          </div>
          <h2 className="mt-2 font-display text-xl font-bold">
            {transaction.name}
          </h2>
          <p className="mt-1 text-xs text-[#82938f]">
            Transaction {transaction.id} · {transaction.role}
          </p>
        </div>
        <StatusBadge status={transaction.status} />
      </div>
      <div className="mt-7 grid gap-3 md:grid-cols-6">
        {stages.map((stage, index) => (
          <div
            className="relative flex items-center gap-3 md:block"
            key={stage}
          >
            <div
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-bold ${index < completedCount ? "bg-[#d9f1e4] text-[#0b776d]" : index === completedCount ? "bg-[#fff0c9] text-[#ad7b1d]" : "bg-[#f1f5f3] text-[#96a6a2]"}`}
            >
              {index < completedCount ? <CheckCircle2 size={16} /> : index + 1}
            </div>
            <p
              className={`text-[11px] font-semibold ${index === completedCount ? "text-[#ad7b1d]" : "text-[#70827d]"}`}
            >
              {stage}
            </p>
            {index < stages.length - 1 && (
              <span className="absolute left-4 top-8 h-4 border-l border-dashed border-[#cbdad4] md:left-[calc(100%_-_8px)] md:top-4 md:w-full md:border-l-0 md:border-t" />
            )}
          </div>
        ))}
      </div>
      <div className="mt-7 flex flex-col justify-between gap-4 rounded-lg bg-[#eef8f3] p-4 sm:flex-row sm:items-center">
        <p className="max-w-2xl text-xs leading-5 text-[#4f7169]">
          {attentionMessages[transaction.status] || <>Your <strong>{transaction.amount} transaction needs your attention.</strong> Review the latest deal status for next steps.</>}
        </p>
        <Link
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#0b776d] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#095c55]"
          to={`/dashboard/transactions/${transaction.id}`}
        >
          View transaction <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  );
}
function TransactionCard({ transaction }) {
  return (
    <article className="rounded-xl border border-[#e3ebe7] bg-white p-4 shadow-[0_3px_12px_rgba(16,42,42,.03)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-sm font-bold">{transaction.name}</h3>
          <p className="mt-1 text-[11px] text-[#8a9b97]">{transaction.id}</p>
        </div>
        <StatusBadge status={transaction.status} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-[10px] uppercase text-[#92a39f]">Role</p>
          <p className="mt-1 font-semibold">{transaction.role}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-[#92a39f]">Amount</p>
          <p className="mt-1 font-bold">{transaction.amount}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-[#92a39f]">Other party</p>
          <p className="mt-1 font-semibold">{transaction.otherParty}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-[#92a39f]">Date</p>
          <p className="mt-1 text-[#687b76]">{transaction.date}</p>
        </div>
      </div>
      <Link
        className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#0b776d]"
        to={`/dashboard/transactions/${transaction.id.slice(1)}`}
      >
        View transaction <ArrowRight size={14} />
      </Link>
    </article>
  );
}
function TransactionTable({ transactions }) {
  return (
    <section className="rounded-xl border border-[#e3ebe7] bg-white shadow-[0_3px_12px_rgba(16,42,42,.03)]">
      <div className="flex items-center justify-between border-b border-[#edf1ef] p-5">
        <div>
          <h2 className="font-display text-base font-bold">
            Recent Transactions
          </h2>
          <p className="mt-1 text-xs text-[#8a9b97]">
            Your latest protected deals
          </p>
        </div>
        <Link
          className="hidden items-center gap-1 text-xs font-bold text-[#0b776d] sm:flex"
          to="/dashboard/transactions"
        >
          View all transactions <ArrowRight size={14} />
        </Link>
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#f8faf9] text-[10px] uppercase tracking-wide text-[#91a29e]">
            <tr>
              {[
                "Transaction",
                "Role",
                "Other Party",
                "Amount",
                "Status",
                "Date",
                "Action",
              ].map((heading) => (
                <th className="px-5 py-3 font-bold" key={heading}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr className="border-t border-[#edf1ef]" key={transaction.id}>
                <td className="px-5 py-4">
                  <strong className="block">{transaction.name}</strong>
                  <span className="text-[10px] text-[#9aa9a5]">
                    {transaction.id}
                  </span>
                </td>
                <td className="px-5 py-4">{transaction.role}</td>
                <td className="px-5 py-4">{transaction.otherParty}</td>
                <td className="px-5 py-4 font-bold">{transaction.amount}</td>
                <td className="px-5 py-4">
                  <StatusBadge status={transaction.status} />
                </td>
                <td className="px-5 py-4 text-[#718580]">{transaction.date}</td>
                <td className="px-5 py-4">
                  <Link
                    className="font-bold text-[#0b776d]"
                    to={`/dashboard/transactions/${transaction.id.slice(1)}`}
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 p-4 md:hidden">
            {transactions.map((transaction) => (
          <TransactionCard transaction={transaction} key={transaction.id} />
        ))}
        <Link
          className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-[#0b776d]"
          to="/dashboard/transactions"
        >
          View all transactions <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}
function QuickActions() {
  const actions = [
    [
      Plus,
      "Create a Deal",
      "Protect a new transaction.",
      "/dashboard/create-deal",
    ],
    [
      ListChecks,
      "View Transactions",
      "See your active and completed deals.",
      "/dashboard/transactions",
    ],
    [
      Search,
      "Track a Deal",
      "Find a transaction by ID.",
      "/dashboard/transactions",
    ],
    [HelpCircle, "Get Help", "Contact DealSafe support.", "/dashboard/help"],
  ];
  return (
    <section>
      <h2 className="mb-4 font-display text-base font-bold">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3">
        {actions.map(([Icon, title, text, href], index) => (
          <Link
            className={`rounded-xl border p-4 transition hover:-translate-y-0.5 hover:shadow-md ${index === 0 ? "border-[#0b776d] bg-[#0b776d] text-white" : "border-[#e3ebe7] bg-white"}`}
            to={href}
            key={title}
          >
            <Icon size={19} />
            <h3 className="mt-4 text-xs font-bold">{title}</h3>
            <p
              className={`mt-1 text-[10px] leading-4 ${index === 0 ? "text-[#c7e8dc]" : "text-[#859793]"}`}
            >
              {text}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
function ProtectedFundsCard({ amount = 0, count = 0 }) {
  return (
    <section className="rounded-xl bg-[#0e3d3c] p-6 text-white">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[1.1px] text-[#a5d8c5]">
            Your protected transactions
          </p>
          <strong className="mt-3 block font-display text-3xl">
            GHS {amount.toLocaleString("en-GH", { minimumFractionDigits: 2 })}
          </strong>
          <p className="mt-1 text-xs text-[#b5d2c9]">
            currently protected across {count} transaction{count === 1 ? "" : "s"}.
          </p>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#236155]">
          <LockKeyhole size={20} />
        </div>
      </div>
      <div className="mt-6 h-2 overflow-hidden rounded-full bg-[#286155]">
        <div className="h-full w-[68%] rounded-full bg-[#7dd4ae]" />
      </div>
      <p className="mt-4 text-[11px] leading-5 text-[#b5d2c9]">
        Protected funds remain within the transaction flow until the required
        conditions are completed.
      </p>
      <Link
        className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[#a5e5c8]"
        to="/dashboard/transactions"
      >
        View protected deals <ArrowRight size={14} />
      </Link>
    </section>
  );
}
function ActivityTimeline({ activities }) {
  const icons = [LockKeyhole, CheckCircle2, PackageCheck, CircleDollarSign];
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-base font-bold">Recent Activity</h2>
        <Activity size={18} className="text-[#8ca19b]" />
      </div>
      <div className="rounded-xl border border-[#e3ebe7] bg-white p-5">
          {activities.length === 0 ? <p className="py-5 text-xs text-[#82938f]">No recent activity yet.</p> : activities.map(([title, text, time], index) => {
          const Icon = icons[index];
          return (
            <div className="relative flex gap-3 pb-5 last:pb-0" key={title}>
              <div className="relative z-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#e5f3ed] text-[#0b776d]">
                <Icon size={14} />
              </div>
              {index < activities.length - 1 && (
                <span className="absolute left-3.5 top-7 h-full border-l border-dashed border-[#cbdad4]" />
              )}
              <div>
                <h3 className="text-xs font-bold">{title}</h3>
                <p className="mt-1 text-[11px] leading-4 text-[#82938f]">
                  {text}
                </p>
                <time className="mt-1 block text-[10px] text-[#a1afab]">
                  {time}
                </time>
              </div>
            </div>
          );
          })}
      </div>
    </section>
  );
}
function SafetyReminder() {
  return (
    <section className="rounded-xl border border-[#eadfbf] bg-[#fff9e9] p-5">
      <div className="flex gap-3">
        <AlertTriangle size={19} className="shrink-0 text-[#c89429]" />
        <div>
          <h2 className="text-sm font-bold text-[#6f5821]">Stay protected</h2>
          <p className="mt-2 text-[11px] leading-5 text-[#826e3c]">
            Never send additional money directly to a buyer or seller for a
            transaction handled through DealSafe. Keep communication and
            evidence attached to your deal.
          </p>
          <Link
            className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-[#956f17]"
            to="/#safety"
          >
            Learn about DealSafe safety <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </section>
  );
}
function EmptyState({ title, text, action = "Create My First Deal" }) {
  return (
    <div className="rounded-xl border border-dashed border-[#cbdad4] bg-white p-8 text-center">
      <FileText size={28} className="mx-auto text-[#8bb5a7]" />
      <h2 className="mt-4 font-display text-base font-bold">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-[#82938f]">
        {text}
      </p>
      <a
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#0b776d] px-4 py-2.5 text-xs font-bold text-white"
        href="/dashboard/create-deal"
      >
        {action}
        <ArrowRight size={14} />
      </a>
    </div>
  );
}
export function DashboardLayout({ children, user = auth.currentUser }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-[#f7f9f4] font-sans text-[#102a2a]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardNavbar user={user} onMenu={() => setMobileOpen(true)} />
        <main className="mx-auto w-full max-w-[1440px] flex-1 p-5 sm:p-8">
          {children}
        </main>
      </div>
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-20 bg-[#102a2a66] lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <Sidebar mobile onClose={() => setMobileOpen(false)} />
        </>
      )}
    </div>
  );
}

function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [profileName, setProfileName] = useState("");
  useEffect(() => { if (!auth.currentUser) { setLoadingTransactions(false); return undefined; } const unsubscribe = onSnapshot(query(collection(db, "deals"), where("creatorId", "==", auth.currentUser.uid)), (snapshot) => { setTransactions(snapshot.docs.map((document) => { const data = document.data(); const statusLabels = { awaiting_seller: "Waiting for Seller", awaiting_buyer: "Waiting for Buyer", waiting_for_payment: "Waiting for Payment", payment_secured: "Payment Secured", awaiting_delivery: "Awaiting Delivery", awaiting_confirmation: "Awaiting Confirmation", ready_for_release: "Ready for Release", completed: "Completed", disputed: "Disputed", cancelled: "Cancelled", refunded: "Refunded" }; return { ...data, documentId: document.id, id: data.transactionCode || `DS-${document.id.slice(0, 5).toUpperCase()}`, name: data.title || "Untitled deal", role: data.creatorRole === "seller" ? "Seller" : "Buyer", otherParty: typeof data.otherParty === "object" ? data.otherParty?.fullName || "Other party" : data.otherParty || "Other party", amount: `GHS ${Number(data.amount || 0).toLocaleString("en-GH", { minimumFractionDigits: 2 })}`, status: statusLabels[data.status] || data.status || "Awaiting review" }; })); setLoadingTransactions(false); }, () => setLoadingTransactions(false)); return unsubscribe; }, []);
  useEffect(() => { if (!auth.currentUser) return undefined; getDoc(doc(db, "users", auth.currentUser.uid)).then((snapshot) => { if (snapshot.exists()) setProfileName(snapshot.data().fullName || ""); }).catch(() => {}); return undefined; }, []);
  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 18 ? "Good afternoon" : "Good evening";
  const userName = profileName || auth.currentUser?.displayName || auth.currentUser?.email?.split("@")[0] || "there";
  const activeTransactions = transactions.filter((transaction) => transaction.status !== "Completed" && transaction.status !== "Cancelled");
  const protectedAmount = activeTransactions.reduce((total, transaction) => total + Number(String(transaction.amount).replace(/[^0-9.]/g, "")), 0);
  const attentionTransaction = activeTransactions[0];
  const location = useLocation();
  const title =
    routeTitles[location.pathname] ||
    (location.pathname.startsWith("/dashboard/transactions/")
      ? "Transaction Details"
      : "Dashboard");
  const isHome = location.pathname === "/dashboard";
  return (
    <DashboardLayout title={title}>
      {isHome ? (
        <>
              <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[1.2px] text-[#0b776d]">
                    {now.toLocaleDateString("en-GH", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">
                    {greeting}, {userName} <span aria-hidden="true">👋</span>
                  </h2>
                  <p className="mt-2 text-sm text-[#718580]">
                    Here's what's happening with your DealSafe transactions.
                  </p>
                </div>
                <Link
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0b776d] px-4 py-3 text-xs font-bold text-white shadow-sm hover:bg-[#095c55]"
                  to="/dashboard/create-deal"
                >
                  <Plus size={17} /> Create new deal
                </Link>
              </div>
              <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  icon={ListChecks}
                  label="Active Deals"
                  value={loadingTransactions ? "..." : activeTransactions.length}
                  detail="Currently in progress"
                  tone="bg-[#e5f3ed] text-[#0b776d]"
                />
                <StatCard
                  icon={LockKeyhole}
                  label="Money Protected"
                  value={loadingTransactions ? "..." : `GHS ${protectedAmount.toLocaleString("en-GH", { minimumFractionDigits: 2 })}`}
                  detail="Across active transactions"
                  tone="bg-[#e5eff8] text-[#28719a]"
                />
                <StatCard
                  icon={CheckCircle2}
                  label="Completed Deals"
                  value={loadingTransactions ? "..." : transactions.filter((transaction) => transaction.status === "Completed").length}
                  detail="Successfully completed"
                  tone="bg-[#e8f4e9] text-[#3c8a56]"
                />
                <StatCard
                  icon={Scale}
                  label="Disputes"
                  value={loadingTransactions ? "..." : transactions.filter((transaction) => transaction.status === "Disputed").length}
                  detail="Transactions requiring attention"
                  tone="bg-[#fff2d5] text-[#a97b22]"
                />
              </div>
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(290px,.75fr)]">
                <div className="grid gap-6">
                  <AttentionTransaction transaction={attentionTransaction} />
                  {loadingTransactions ? <div className="rounded-xl border border-[#e3ebe7] bg-white p-8 text-sm text-[#718580]">Loading your transactions...</div> : <TransactionTable transactions={transactions} />}
                </div>
                <div className="grid content-start gap-6">
                  <QuickActions />
                  <ProtectedFundsCard amount={protectedAmount} count={activeTransactions.length} />
                  <ActivityTimeline activities={[]} />
                  <SafetyReminder />
                </div>
              </div>
        </>
      ) : (
            <EmptyState
              title={`${title} is ready for your next step`}
              text="This dashboard area is prepared for DealSafe data and actions. Use the navigation to manage your protected transactions."
              action={
                title === "Create Deal"
                  ? "Start Creating a Deal"
                  : "Go to Dashboard"
              }
            />
      )}
    </DashboardLayout>
  );
}

export default Dashboard;
