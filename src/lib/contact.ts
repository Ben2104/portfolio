const ENDPOINT = "https://formsubmit.co/ajax/dohoangkhoi341@gmail.com";

export type ContactInput = { name: string; email: string; subject?: string; message: string };

/** Posts the form to FormSubmit, which forwards it to my inbox. Throws when it is not accepted. */
export async function sendMessage(f: ContactInput) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ ...f, _subject: f.subject || "Portfolio inquiry from " + f.name, _template: "table", _honey: "" }),
  });
  const out = (await res.json().catch(() => ({}))) as { success?: boolean | string; message?: string } | null;
  if (!res.ok || (out?.success !== true && out?.success !== "true")) {
    throw new Error(out?.message || "The message could not be sent.");
  }
}
