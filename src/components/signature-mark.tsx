import { formatAuthor, formatCareStamp } from "@/lib/format";
import { isSignatureValid } from "@/lib/signature";
import type { Note } from "@/lib/types";

export function SignatureMark({ note }: { note: Note }) {
  const sig = note.signature;
  const valid = isSignatureValid(note);

  if (!valid || !sig) {
    return (
      <div className="mt-10 w-72">
        <div className="h-14 border-b border-ink/35" />
        <p className="mt-1 text-[0.8rem]">Authorized signature</p>
      </div>
    );
  }

  const who = formatAuthor(sig.signerName, sig.signerTitle);

  return (
    <div className="mt-10 w-80">
      {sig.kind === "drawn" && sig.imageDataUrl ? (
        <img
          src={sig.imageDataUrl}
          alt={`Signature of ${who}`}
          className="h-14 w-auto max-w-full object-contain object-left print-exact"
        />
      ) : (
        <p className="font-signature text-[2.35rem] leading-none text-ink">
          {sig.typedName}
        </p>
      )}
      <div className="mt-1 border-t border-ink pt-1">
        <p className="font-bold">{who}</p>
        <p className="text-[0.8rem]">
          Digitally signed {formatCareStamp(sig.signedAt)}
        </p>
      </div>
    </div>
  );
}
