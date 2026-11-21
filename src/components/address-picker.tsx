import { setAddress } from "@/app/profile/actions";
import { addressLabels, type Address } from "@/lib/address";

/** Two buttons that save how the app should address the user. */
export function AddressPicker({
  current,
  next,
}: {
  current: Address | null;
  next: string;
}) {
  return (
    <form action={setAddress} className="flex flex-wrap gap-3">
      <input type="hidden" name="next" value={next} />
      {(Object.keys(addressLabels) as Address[]).map((key) => (
        <button
          key={key}
          type="submit"
          name="address"
          value={key}
          aria-pressed={current === key}
          className={`min-h-12 rounded-2xl px-5 font-bold transition ${
            current === key
              ? "bg-blue text-white"
              : "text-ink ring-line hover:bg-sky-soft bg-white ring-2"
          }`}
        >
          {addressLabels[key]}
        </button>
      ))}
    </form>
  );
}
