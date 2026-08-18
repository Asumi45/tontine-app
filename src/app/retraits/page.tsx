import { db } from "@/db";
import { participants, payouts } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { NumeroBadge } from "@/components/badge";

async function toggleVerse(formData: FormData) {
  "use server";
  const payoutId = Number(formData.get("payoutId"));
  const [current] = await db.select().from(payouts).where(eq(payouts.id, payoutId));
  await db.update(payouts).set({ verse: !current.verse }).where(eq(payouts.id, payoutId));
  revalidatePath("/retraits");
}

export default async function RetraitsPage() {
  const today = new Date().toISOString().split("T")[0];
  const allParticipants = await db.select().from(participants);
  const allPayouts = await db.select().from(payouts).orderBy(asc(payouts.dateVersement));
  const verseCount = allPayouts.filter((p) => p.verse).length;

  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <header className="animate-fade-up">
          <a href="/" className="text-xs font-mono uppercase tracking-wide text-sage hover:underline">← Accueil</a>
          <h1 className="font-display text-2xl font-bold text-ink mt-1">Retraits</h1>
        </header>

        <div className="bg-white rounded-2xl shadow border border-rose/30 p-4 flex items-center justify-between animate-fade-up" style={{ animationDelay: "60ms" }}>
          <p className="text-xs uppercase tracking-widest text-ink/50 font-mono">Versés</p>
          <p className="font-display text-2xl font-bold text-ink">
            {verseCount}<span className="text-base text-ink/30 font-sans"> / {allPayouts.length}</span>
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow divide-y divide-rose/30 border border-rose/30 overflow-hidden animate-fade-up" style={{ animationDelay: "120ms" }}>
          {allPayouts.map((payout, i) => {
            const participant = allParticipants.find((p) => p.id === payout.participantId);
            const isPast = payout.dateVersement <= today;
            const isNext = !payout.verse && isPast;
            return (
              <form
                key={payout.id}
                action={toggleVerse}
                className={`flex justify-between items-center px-4 py-3 animate-fade-up ${isNext ? "bg-coral/5" : ""}`}
                style={{ animationDelay: `${140 + i * 15}ms` }}
              >
                <input type="hidden" name="payoutId" value={payout.id} />
                <div className="flex items-center gap-3">
                  <NumeroBadge numero={participant?.numero ?? 0} highlight={isNext} />
                  <div>
                    <span className="font-medium text-ink">{participant?.nom}</span>
                    <p className="text-xs font-mono text-ink/40">
                      {new Date(payout.dateVersement).toLocaleDateString("fr-FR")} · {payout.montant.toLocaleString("fr-FR")} Ar
                    </p>
                  </div>
                </div>
                <button
                  type="submit"
                  className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wide font-semibold whitespace-nowrap transition-transform active:scale-90 ${
                    payout.verse ? "bg-sage/20 text-sage border border-sage/40" : "bg-ink/5 text-ink/40 border border-ink/10"
                  }`}
                >
                  {payout.verse ? "✓ Versé" : "Non versé"}
                </button>
              </form>
            );
          })}
        </div>
      </div>
    </div>
  );
}
