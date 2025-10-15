export default function Field({ label, value, onChange, type = "text" }) {
return (
<div>
<label className="text-xs text-gray-500">{label}</label>
<input
type={type}
value={value}
onChange={(e) => onChange(type === "number" ? Number(e.target.value) : e.target.value)}
className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm shadow-sm"
/>
</div>
);
}