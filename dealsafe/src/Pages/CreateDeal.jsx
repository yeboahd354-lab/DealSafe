import { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  CircleAlert,
  ImagePlus,
  Link as LinkIcon,
  LockKeyhole,
  MessageCircle,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Store,
  Upload,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { DashboardLayout } from "../Components/Dashboard";
import { auth, db } from "../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { sendDealCreatedEmail } from "../services/dealEmail";

const initialDeal = {
  role: "",
  dealType: "",
  title: "",
  description: "",
  source: "",
  sourceUrl: "",
  images: [],
  amount: "",
  otherParty: { fullName: "", phone: "", email: "" },
  deliveryMethod: "",
  deliveryArea: "",
  completionDate: "",
  inspectionPeriod: "",
  terms: "",
};
const steps = ["Deal Details", "Other Party", "Delivery & Terms", "Review"];
const sources = [
  [MessageCircle, "TikTok"],
  [Camera, "Instagram"],
  [MessageCircle, "WhatsApp"],
  [Store, "Facebook"],
  [LinkIcon, "X"],
  [UsersIcon, "In Person"],
  [LinkIcon, "Other"],
];
function UsersIcon(props) {
  return <Store {...props} />;
}
function Field({ label, error, children, hint }) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-[#173b3a]">
      {label}
      {children}
      {hint && (
        <span className="text-[11px] font-normal text-[#7c918c]">{hint}</span>
      )}
      {error && (
        <span className="flex items-center gap-1 text-[11px] font-medium text-rose-600">
          <CircleAlert size={13} />
          {error}
        </span>
      )}
    </label>
  );
}
function Choice({ selected, onClick, icon: Icon, title, text }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[92px] items-start gap-3 rounded-xl border p-4 text-left transition ${selected ? "border-[#0b776d] bg-[#e8f5ef] ring-2 ring-[#0b776d1a]" : "border-[#dce7e2] bg-white hover:border-[#9fc8b8]"}`}
      aria-pressed={selected}
    >
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${selected ? "bg-[#0b776d] text-white" : "bg-[#eef5f1] text-[#0b776d]"}`}
      >
        <Icon size={18} />
      </span>
      <span>
        <strong className="block text-sm">{title}</strong>
        <small className="mt-1 block text-[11px] font-normal leading-4 text-[#738984]">
          {text}
        </small>
      </span>
      {selected && <Check className="ml-auto text-[#0b776d]" size={17} />}
    </button>
  );
}
function Input({ className = "", ...props }) {
  return (
    <input
      className={`h-11 w-full rounded-lg border border-[#cbdad4] bg-[#fbfdfb] px-3 text-sm font-normal text-[#173b3a] outline-none placeholder:text-[#9baba7] focus:border-[#0b776d] focus:ring-4 focus:ring-[#0b776d1a] ${className}`}
      {...props}
    />
  );
}
function Textarea({ ...props }) {
  return (
    <textarea
      className="min-h-32 w-full resize-y rounded-lg border border-[#cbdad4] bg-[#fbfdfb] p-3 text-sm font-normal leading-6 text-[#173b3a] outline-none placeholder:text-[#9baba7] focus:border-[#0b776d] focus:ring-4 focus:ring-[#0b776d1a]"
      {...props}
    />
  );
}
function Progress({ current, onStep }) {
  return (
    <div className="mb-7 grid grid-cols-4 gap-1 sm:gap-4">
      {steps.map((step, index) => (
        <button
          type="button"
          key={step}
          disabled={index > current}
          onClick={() => onStep(index)}
          className={`relative flex items-center gap-2 text-left text-[11px] font-bold sm:text-xs ${index === current ? "text-[#0b776d]" : index < current ? "text-[#5d8176]" : "text-[#9aaba6]"}`}
        >
          <span
            className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] ${index === current ? "bg-[#0b776d] text-white" : index < current ? "bg-[#d9f1e4] text-[#0b776d]" : "bg-[#edf2ef]"}`}
          >
            {index < current ? <Check size={14} /> : index + 1}
          </span>
          <span className="hidden sm:block">{step}</span>
          {index < 3 && (
            <span className="absolute left-8 top-3 hidden w-[calc(100%-16px)] border-t border-dashed border-[#cbdad4] sm:block" />
          )}
        </button>
      ))}
    </div>
  );
}
function ImageUpload({ images, onChange }) {
  const inputRef = useRef(null);
  const addFiles = (files) => {
    const valid = Array.from(files)
      .filter((file) =>
        ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      )
      .slice(0, 5 - images.length);
    onChange([
      ...images,
      ...valid.map((file) => ({ file, url: URL.createObjectURL(file) })),
    ]);
  };
  return (
    <div>
      <div className="rounded-xl border border-dashed border-[#a9c9bc] bg-[#f5faf7] p-5 text-center">
        <Upload className="mx-auto text-[#0b776d]" size={25} />
        <h3 className="mt-2 text-sm font-bold">Add photos or screenshots</h3>
        <p className="mt-1 text-xs font-normal text-[#7d928c]">
          Upload item photos, specifications or relevant screenshots. JPG, PNG
          or WEBP. Maximum 5.
        </p>
        <button
          type="button"
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#b8d2c7] bg-white px-4 py-2.5 text-xs font-bold text-[#0b776d] hover:bg-[#e8f5ef]"
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus size={15} /> Choose files
        </button>
        <input
          ref={inputRef}
          className="hidden"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(event) => addFiles(event.target.files)}
        />
      </div>
      {images.length > 0 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {images.map((image, index) => (
            <div
              className="relative aspect-square overflow-hidden rounded-lg border border-[#dce7e2]"
              key={image.url}
            >
              <img
                className="h-full w-full object-cover"
                src={image.url}
                alt={`Deal evidence ${index + 1}`}
              />
              <button
                type="button"
                className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-white/90 text-rose-600"
                onClick={() =>
                  onChange(
                    images.filter((_, imageIndex) => imageIndex !== index),
                  )
                }
                aria-label="Remove image"
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function Card({ children, className = "" }) {
  return (
    <section
      className={`rounded-xl border border-[#e1ebe6] bg-white p-5 shadow-[0_3px_12px_rgba(16,42,42,.03)] sm:p-7 ${className}`}
    >
      {children}
    </section>
  );
}
function DetailStep({ deal, setDeal, errors }) {
  return (
    <div className="grid gap-6">
      <div>
        <h2 className="font-display text-xl font-bold sm:text-2xl">
          What are you making a deal for?
        </h2>
        <p className="mt-1 text-sm text-[#718580]">
          Tell us what you're buying or selling.
        </p>
      </div>
      <Card>
        <h3 className="mb-3 font-display text-base font-bold">
          What is your role in this deal?
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Choice
            selected={deal.role === "buyer"}
            onClick={() => setDeal({ ...deal, role: "buyer" })}
            icon={ShoppingBag}
            title="I'm Buying"
            text="I'm paying for a product or service."
          />
          <Choice
            selected={deal.role === "seller"}
            onClick={() => setDeal({ ...deal, role: "seller" })}
            icon={Store}
            title="I'm Selling"
            text="I'm receiving payment for a product or service."
          />
        </div>
        {errors.role && (
          <p className="mt-2 text-[11px] text-rose-600">{errors.role}</p>
        )}
      </Card>
      <Card>
        <h3 className="mb-4 font-display text-base font-bold">Deal details</h3>
        <div className="grid gap-5">
          <Field
            label="What type of transaction is this?"
            error={errors.dealType}
          >
            <div className="grid grid-cols-3 gap-2">
              {["Physical Product", "Service", "Other"].map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setDeal({ ...deal, dealType: type })}
                  className={`rounded-lg border px-2 py-3 text-xs font-bold ${deal.dealType === type ? "border-[#0b776d] bg-[#e8f5ef] text-[#0b776d]" : "border-[#dce7e2] text-[#718580]"}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </Field>
          <Field label="What are you buying/selling?" error={errors.title}>
            <Input
              value={deal.title}
              maxLength={100}
              placeholder="e.g. iPhone 15 Pro 256GB"
              onChange={(event) =>
                setDeal({ ...deal, title: event.target.value })
              }
            />
            <span className="text-right text-[10px] font-normal text-[#91a29e]">
              {deal.title.length}/100
            </span>
          </Field>
          <Field
            label="Describe the deal"
            error={errors.description}
            hint="Include condition, specifications and anything both parties agreed on."
          >
            <Textarea
              value={deal.description}
              required
              placeholder="iPhone 15 Pro, 256GB, Blue Titanium. Used for 6 months. Battery health: 96%."
              onChange={(event) =>
                setDeal({ ...deal, description: event.target.value })
              }
            />
          </Field>
        </div>
      </Card>
      <Card>
        <h3 className="font-display text-base font-bold">
          Where did this deal start?
        </h3>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {sources.map(([Icon, source]) => (
            <button
              type="button"
              key={source}
              onClick={() => setDeal({ ...deal, source })}
              className={`flex items-center gap-2 rounded-lg border px-3 py-3 text-xs font-bold ${deal.source === source ? "border-[#0b776d] bg-[#e8f5ef] text-[#0b776d]" : "border-[#dce7e2] text-[#718580]"}`}
            >
              <Icon size={15} />
              {source}
            </button>
          ))}
        </div>
        <div className="mt-5">
          <Field
            label="Product or conversation link"
            hint="Optional. It helps keep a clearer record of the agreement."
          >
            <div className="relative">
              <LinkIcon
                className="absolute left-3 top-3 text-[#829690]"
                size={16}
              />
              <Input
                className="pl-9"
                type="url"
                value={deal.sourceUrl}
                placeholder="Paste the original listing or conversation link"
                onChange={(event) =>
                  setDeal({ ...deal, sourceUrl: event.target.value })
                }
              />
            </div>
          </Field>
        </div>
      </Card>
      <Card>
        <ImageUpload
          images={deal.images}
          onChange={(images) => setDeal({ ...deal, images })}
        />
      </Card>
      <Card>
        <h3 className="font-display text-base font-bold">Deal Amount</h3>
        <p className="mt-1 text-xs text-[#718580]">
          This is the amount agreed between you and the other party.
        </p>
        <div className="mt-4 flex items-center overflow-hidden rounded-lg border border-[#cbdad4] bg-[#fbfdfb] focus-within:border-[#0b776d] focus-within:ring-4 focus-within:ring-[#0b776d1a]">
          <span className="border-r border-[#dce7e2] px-4 text-sm font-bold text-[#0b776d]">
            GHS
          </span>
          <input
            className="h-14 min-w-0 flex-1 bg-transparent px-4 text-xl font-bold outline-none"
            type="number"
            min="0.01"
            step="0.01"
            value={deal.amount}
            placeholder="8,000.00"
            onChange={(event) =>
              setDeal({ ...deal, amount: event.target.value })
            }
          />
        </div>
        {errors.amount && (
          <p className="mt-2 text-[11px] text-rose-600">{errors.amount}</p>
        )}
        <div className="mt-5 grid gap-2 border-t border-[#e6eeea] pt-4 text-xs">
          <div className="flex justify-between">
            <span>Deal amount</span>
            <strong>
              GHS{" "}
              {Number(deal.amount || 0).toLocaleString("en-GH", {
                minimumFractionDigits: 2,
              })}
            </strong>
          </div>
          <div className="flex justify-between text-[#718580]">
            <span>DealSafe protection fee</span>
            <span>Calculated at payment</span>
          </div>
          <div className="flex justify-between border-t border-[#e6eeea] pt-2 font-bold">
            <span>Amount to protect</span>
            <span>
              GHS{" "}
              {Number(deal.amount || 0).toLocaleString("en-GH", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
function PartyStep({ deal, setDeal, errors }) {
  const party = deal.role === "seller" ? "Buyer" : "Seller";
  return (
    <div className="grid gap-6">
      <div>
        <h2 className="font-display text-xl font-bold sm:text-2xl">
          Who are you making this deal with?
        </h2>
        <p className="mt-1 text-sm text-[#718580]">
          Enter the {party.toLowerCase()}'s contact details so we can invite them to review and accept the transaction.
        </p>
      </div>
      <Card>
        <h3 className="font-display text-base font-bold">{party} contact details</h3>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="Full name" error={errors.fullName}>
            <Input
              value={deal.otherParty.fullName}
              placeholder="e.g. John Mensah"
              onChange={(event) =>
                setDeal({
                  ...deal,
                  otherParty: {
                    ...deal.otherParty,
                    fullName: event.target.value,
                  },
                })
              }
            />
          </Field>
          <Field label="Phone number" error={errors.phone}>
            <Input
              type="tel"
              value={deal.otherParty.phone}
              placeholder="024 123 4567"
              onChange={(event) =>
                setDeal({
                  ...deal,
                  otherParty: { ...deal.otherParty, phone: event.target.value },
                })
              }
            />
          </Field>
          <Field
            label="Email address"
            error={errors.email}
            hint="Optional if a phone number is supplied."
          >
            <Input
              type="email"
              value={deal.otherParty.email}
              placeholder="john@example.com"
              onChange={(event) =>
                setDeal({
                  ...deal,
                  otherParty: { ...deal.otherParty, email: event.target.value },
                })
              }
            />
          </Field>
        </div>
      </Card>
      <div className="flex gap-3 rounded-xl border border-[#bfdfd0] bg-[#eff9f4] p-5">
        <LockKeyhole className="shrink-0 text-[#0b776d]" size={20} />
        <div>
          <h3 className="text-sm font-bold">What happens next?</h3>
          <p className="mt-1 text-xs leading-5 text-[#58766e]">
            After you create this deal, {party.toLowerCase()} will receive an
            invitation to review the transaction details. They must accept
            before the transaction can proceed.
          </p>
        </div>
      </div>
    </div>
  );
}
function TermsStep({ deal, setDeal, errors }) {
  return (
    <div className="grid gap-6">
      <div>
        <h2 className="font-display text-xl font-bold sm:text-2xl">
          Delivery and agreement
        </h2>
        <p className="mt-1 text-sm text-[#718580]">
          Clearly define how this deal should be completed.
        </p>
      </div>
      <Card>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="How will the item be delivered?">
            <select
              className="h-11 rounded-lg border border-[#cbdad4] bg-[#fbfdfb] px-3 text-sm outline-none focus:border-[#0b776d]"
              value={deal.deliveryMethod}
              onChange={(event) =>
                setDeal({ ...deal, deliveryMethod: event.target.value })
              }
            >
              <option value="">Select a method</option>
              {["Delivery/Courier", "Meet in Person", "Pickup", "Other"].map(
                (method) => (
                  <option key={method}>{method}</option>
                ),
              )}
            </select>
          </Field>
          {deal.deliveryMethod === "Delivery/Courier" && (
            <Field
              label="Delivery area"
              hint="No exact residential address is needed."
            >
              <Input
                value={deal.deliveryArea}
                placeholder="e.g. East Legon, Accra"
                onChange={(event) =>
                  setDeal({ ...deal, deliveryArea: event.target.value })
                }
              />
            </Field>
          )}
          <Field
            label="When should this deal be completed?"
            error={errors.completionDate}
          >
            <Input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={deal.completionDate}
              onChange={(event) =>
                setDeal({ ...deal, completionDate: event.target.value })
              }
            />
          </Field>
          <Field
            label="Inspection period"
            hint="This is stored as part of the terms; no automatic release is triggered."
          >
            <select
              className="h-11 rounded-lg border border-[#cbdad4] bg-[#fbfdfb] px-3 text-sm outline-none focus:border-[#0b776d]"
              value={deal.inspectionPeriod}
              onChange={(event) =>
                setDeal({ ...deal, inspectionPeriod: event.target.value })
              }
            >
              <option value="">Select a period</option>
              {["Confirm immediately", "6 hours", "12 hours", "24 hours"].map(
                (period) => (
                  <option key={period}>{period}</option>
                ),
              )}
            </select>
          </Field>
        </div>
      </Card>
      <Card>
        <Field
          label="Terms of this deal"
          error={errors.terms}
          hint="Clear terms can make disputes easier to understand and resolve."
        >
          <Textarea
            value={deal.terms}
            placeholder="Seller agrees to deliver the exact item described above within 2 days.\n\nBuyer will inspect the item after delivery before confirming completion."
            onChange={(event) =>
              setDeal({ ...deal, terms: event.target.value })
            }
          />
        </Field>
      </Card>
      <div className="rounded-xl border border-[#ead9a6] bg-[#fff9e8] p-5">
        <h3 className="flex items-center gap-2 text-sm font-bold text-[#765b1c]">
          <CircleAlert size={17} />
          Before continuing
        </h3>
        <ul className="mt-3 grid gap-2 pl-5 text-xs leading-5 text-[#806f42]">
          <li>Make sure the description and amount match your agreement.</li>
          <li>Keep important evidence attached to the DealSafe transaction.</li>
          <li>Do not make additional payments outside DealSafe.</li>
          <li>DealSafe is not the buyer or seller of the item.</li>
        </ul>
      </div>
    </div>
  );
}
function ReviewStep({ deal, setStep, agreements, setAgreements }) {
  const date = deal.completionDate
    ? new Date(`${deal.completionDate}T00:00:00`).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Not selected";
  const rows = [
    ["Your role", deal.role === "seller" ? "Seller" : "Buyer", 0],
    ["Deal", deal.title || "Not provided", 0],
    ["Type", deal.dealType || "Not selected", 0],
    ["Source", deal.source || "Not selected", 0],
    [
      "Amount",
      `GHS ${Number(deal.amount || 0).toLocaleString("en-GH", { minimumFractionDigits: 2 })}`,
      0,
    ],
    ["Other party", deal.otherParty.fullName || "Not provided", 1],
    ["Phone", deal.otherParty.phone || "Not provided", 1],
    ["Delivery", deal.deliveryMethod || "Not selected", 2],
    ["Expected completion", date, 2],
    ["Inspection period", deal.inspectionPeriod || "Not selected", 2],
  ];
  return (
    <div className="grid gap-6">
      <div>
        <h2 className="font-display text-xl font-bold sm:text-2xl">
          Review Your Deal
        </h2>
        <p className="mt-1 text-sm text-[#718580]">
          Check everything carefully before sending the invitation.
        </p>
      </div>
      <Card>
        <div className="divide-y divide-[#edf1ef]">
          {rows.map(([label, value, step]) => (
            <div
              className="flex items-center justify-between gap-5 py-3 text-sm"
              key={label}
            >
              <span className="text-[#849691]">{label}</span>
              <span className="text-right font-bold">
                {value}{" "}
                <button
                  type="button"
                  onClick={() => setStep(step)}
                  className="ml-2 text-[11px] text-[#0b776d]"
                >
                  Edit
                </button>
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t border-[#edf1ef] pt-4">
          <p className="text-xs font-bold text-[#849691]">Deal terms</p>
          <p className="mt-2 whitespace-pre-line text-sm leading-6">
            {deal.terms || "Not provided"}
          </p>
        </div>
        {deal.images.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-bold text-[#849691]">
              Attached evidence
            </p>
            <div className="mt-2 flex gap-2">
              {deal.images.map((image) => (
                <img
                  className="h-14 w-14 rounded-lg object-cover"
                  src={image.url}
                  alt="Attached evidence"
                  key={image.url}
                />
              ))}
            </div>
          </div>
        )}
      </Card>
      <Card>
        <label className="flex items-start gap-3 text-xs leading-5 text-[#5d746e]">
          <input
            className="mt-0.5 h-4 w-4 shrink-0 accent-[#0b776d]"
            type="checkbox"
            checked={agreements.accurate}
            onChange={(event) =>
              setAgreements({ ...agreements, accurate: event.target.checked })
            }
          />
          <span>
            I confirm that the information above accurately represents the
            agreement between me and the other party.
          </span>
        </label>
        <label className="mt-4 flex items-start gap-3 text-xs leading-5 text-[#5d746e]">
          <input
            className="mt-0.5 h-4 w-4 shrink-0 accent-[#0b776d]"
            type="checkbox"
            checked={agreements.terms}
            onChange={(event) =>
              setAgreements({ ...agreements, terms: event.target.checked })
            }
          />
          <span>
            I agree to DealSafe's{" "}
            <a className="font-bold text-[#0b776d]" href="#terms">
              Terms of Service
            </a>{" "}
            and{" "}
            <a className="font-bold text-[#0b776d]" href="#dispute">
              Dispute Policy
            </a>
            .
          </span>
        </label>
      </Card>
    </div>
  );
}
function Success({ deal, onReset, transactionId, emailNotice }) {
  return (
    <div className="mx-auto max-w-2xl py-8 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#d9f1e4] text-[#0b776d]">
        <Check size={31} />
      </div>
      <p className="mt-6 text-[11px] font-bold uppercase tracking-[1.2px] text-[#0b776d]">
        Deal created successfully
      </p>
      <h2 className="mt-2 font-display text-3xl font-bold">
        Your DealSafe transaction is ready.
      </h2>
      <p className="mt-3 text-sm text-[#718580]">
        We've created the invitation. Your other party can review and accept the
        deal before payment begins.
      </p>
      {emailNotice && <p className="mx-auto mt-4 max-w-xl rounded-lg bg-[#fff9e8] p-3 text-xs text-[#806f42]">{emailNotice}</p>}
      <div className="mt-7 rounded-xl border border-[#dce7e2] bg-white p-6">
        <p className="text-xs text-[#849691]">Transaction ID</p>
        <strong className="mt-2 block font-display text-2xl">#{transactionId}</strong>
        <p className="mt-3 text-sm font-bold">
          Waiting for {deal.otherParty.fullName || "the other party"} to accept
        </p>
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          className="inline-flex items-center gap-2 rounded-lg bg-[#0b776d] px-5 py-3 text-xs font-bold text-white"
          to="/dashboard"
        >
          Back to dashboard <ArrowRight size={15} />
        </Link>
        <button
          className="inline-flex items-center gap-2 rounded-lg border border-[#bdcec8] px-5 py-3 text-xs font-bold text-[#0b776d]"
          type="button"
          onClick={onReset}
        >
          <Plus size={15} /> Create another deal
        </button>
      </div>
    </div>
  );
}

function CreateDealPage() {
  const [deal, setDeal] = useState(initialDeal);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [agreements, setAgreements] = useState({
    accurate: false,
    terms: false,
  });
  const [success, setSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [transactionCode, setTransactionCode] = useState("");
  const [saveError, setSaveError] = useState("");
  const [emailNotice, setEmailNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const validate = () => {
    const next = {};
    if (!deal.role) next.role = "Choose whether you are buying or selling.";
    if (!deal.dealType) next.dealType = "Choose a transaction type.";
    if (!deal.title.trim()) next.title = "Enter a deal title.";
    if (!deal.description.trim()) next.description = "Describe the deal.";
    if (!deal.amount || Number(deal.amount) <= 0)
      next.amount = "Enter an amount greater than zero.";
    if (step >= 1) {
      if (!deal.otherParty.fullName.trim())
        next.fullName = "Enter their full name.";
      if (!/^[+]?[0-9\s()-]{8,20}$/.test(deal.otherParty.phone))
        next.phone = "Enter a valid phone number.";
      if (
        deal.otherParty.email &&
        !/^\S+@\S+\.\S+$/.test(deal.otherParty.email)
      )
        next.email = "Enter a valid email address.";
    }
    if (step >= 2) {
      if (
        !deal.completionDate ||
        new Date(`${deal.completionDate}T00:00:00`) <
          new Date(new Date().toDateString())
      )
        next.completionDate = "Choose a future completion date.";
      if (!deal.terms.trim()) next.terms = "Add the agreed deal terms.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };
  const nextStep = () => {
    if (validate()) setStep(Math.min(3, step + 1));
  };
  const reset = () => {
    setDeal(initialDeal);
    setStep(0);
    setSuccess(false);
    setAgreements({ accurate: false, terms: false });
    setTransactionId("");
    setTransactionCode("");
    setSaveError("");
    setEmailNotice("");
  };
  const createDeal = async () => {
    if (!auth.currentUser) {
      setSaveError("Your session has expired. Please sign in again.");
      return;
    }
    setSaveError("");
    setSaving(true);
    try {
      const shortCode = `DS-${Math.floor(10000 + Math.random() * 90000)}`;
      const dealDocument = await addDoc(collection(db, "deals"), {
        ...deal,
        images: deal.images.map(({ file, url }) => ({ name: file.name, type: file.type, size: file.size, previewUrl: url })),
        creatorId: auth.currentUser.uid,
        creatorRole: deal.role,
        transactionCode: shortCode,
        status: deal.role === "buyer" ? "awaiting_seller" : "awaiting_buyer",
        invitationAccepted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setTransactionId(dealDocument.id);
      setTransactionCode(shortCode);
      if (deal.otherParty.email) {
        try {
          await sendDealCreatedEmail({ recipient: deal.otherParty.email, recipientName: deal.otherParty.fullName, dealTitle: deal.title, transactionCode: shortCode, amount: `GHS ${Number(deal.amount).toLocaleString("en-GH", { minimumFractionDigits: 2 })}` });
        } catch (emailError) {
          console.error("Unable to send deal invitation email.", emailError);
          setEmailNotice("The deal was saved, but the invitation email could not be sent. You can share the transaction details manually.");
        }
      } else {
        setEmailNotice("The deal was saved. Add the other party's email next time if you want DealSafe to send an invitation automatically.");
      }
      setSuccess(true);
    } catch (error) {
      console.error("Unable to create deal.", error);
      setSaveError("We could not save this deal. Please check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };
  const title = success ? "Deal Created" : "Create a Deal";
  return (
    <DashboardLayout title={title}>
      <div className="mx-auto w-full max-w-5xl">
        {success ? (
          <Success deal={deal} transactionId={transactionCode || transactionId} emailNotice={emailNotice} onReset={reset} />
        ) : (
          <>
            <div className="mb-7 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[1.2px] text-[#0b776d]">
                  Protected transaction setup
                </p>
                <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">
                  Create a Deal
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-[#718580]">
                  Enter the details of your agreement so both parties know
                  exactly what to expect.
                </p>
              </div>
              <span className="flex items-center gap-2 text-[11px] text-[#718580]">
                <ShieldCheck size={16} className="text-[#0b776d]" />
                No payment is made here
              </span>
            </div>
            <Progress
              current={step}
              onStep={(target) => {
                if (target < step) setStep(target);
              }}
            />
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px]">
              <div>
                {step === 0 && (
                  <DetailStep deal={deal} setDeal={setDeal} errors={errors} />
                )}
                {step === 1 && (
                  <PartyStep deal={deal} setDeal={setDeal} errors={errors} />
                )}
                {step === 2 && (
                  <TermsStep deal={deal} setDeal={setDeal} errors={errors} />
                )}
                {step === 3 && (
                  <ReviewStep
                    deal={deal}
                    setStep={setStep}
                    agreements={agreements}
                    setAgreements={setAgreements}
                  />
                )}
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                  <button
                    type="button"
                    onClick={() =>
                      step === 0 ? navigate("/dashboard") : setStep(step - 1)
                    }
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#c5d6cf] px-5 text-xs font-bold text-[#53736b] hover:bg-white"
                  >
                    <ArrowLeft size={15} />
                    {step === 0 ? "Cancel" : "Back"}
                  </button>
                  {step < 3 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#0b776d] px-5 text-xs font-bold text-white hover:bg-[#095c55]"
                    >
                      Continue <ArrowRight size={15} />
                    </button>
                  ) : (
                    <div className="flex flex-col gap-3 sm:flex-row">
                      {saveError && <p className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700" role="alert">{saveError}</p>}
                      <button
                        type="button"
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#c5d6cf] px-5 text-xs font-bold text-[#53736b]"
                      >
                        Save Draft
                      </button>
                      <button
                        type="button"
                        disabled={!agreements.accurate || !agreements.terms}
                        onClick={createDeal}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#0b776d] px-5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {saving ? "Saving deal..." : "Create Deal & Invite"} <ArrowRight size={15} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <aside className="hidden h-fit rounded-xl border border-[#dce7e2] bg-[#eef8f3] p-5 lg:block">
                <LockKeyhole size={19} className="text-[#0b776d]" />
                <h3 className="mt-3 font-display text-sm font-bold">
                  Your agreement stays clear
                </h3>
                <p className="mt-2 text-xs leading-5 text-[#5d786f]">
                  Creating a deal only sends an invitation. Payment comes later,
                  after the other party accepts.
                </p>
              </aside>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default CreateDealPage;
