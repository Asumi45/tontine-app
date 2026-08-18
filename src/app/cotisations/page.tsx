import { db } from "@/db";
import { participants, contributions } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { NumeroBadge } from "@/components/badge";

const MONTANT_JOUR = 1000;

async function togglePaid(formData: FormData) {
  "use server";
  const participantId = Number(formData.get("participantId"));
  const contributionId = formData.get("contributionId");
  const today = new Date().toISOString().split("T")[0];

  if (contributionId) {
    const [current] = await db.select().from(contributions).where(eq(contributions.id, Number(contributionId)));
    await db.update(contributions).set({ paye: !current.paye }).where(eq(contributions.id, Number(contributionId)));
  } else {
    await db.insert(contributions).values({ participantId, date: today, montant: MONTANT_JOUR, paye: true });
  }
  revalidatePath("/cotisations");
}

export default async function CotisationsPage() {
  const today = new Date().toISOString().split("T")[0];
  const allParticipants = await db.select().from(participants).orderBy(asc(participants.numero));
  const todayContributions = await db.select().from(contributions).where(eq(contributions.date, today));
  const payesCount = todayContributions.filter((c) => c.paye).length;
  const pct = Math.round((payesCount / allParticipants.length) * 100);

  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <header className="animate-fade-up">
          <a href="/" className="text-xs font-mono uppercase tracking-wide text-sage hover:underline">← Accueil</a>
          <h1 className="font-display text-2xl font-bold text-ink mt-1">Cotisations du jour</h1>
          <p className="text-sm text-ink/50 font-mono">
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </header>

        <div className="bg-white rounded-2xl shadow border border-rose/30 p-4 space-y-2 animate-fade-up" style={{ animationDelay: "60ms" }}>
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-widest text-ink/50 font-mono">Payé aujourd'hui</p>
            <p className="font-display text-2xl font-bold text-ink">
              {payesCount}<span className="text-base text-ink/30 font-sans"> / {allParticipants.length}</span>
            </p>
          </div>
          <div className="h-2 rounded-full bg-rose/30 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold to-sage transition-all duration-700 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow divide-y divide-rose/30 border border-rose/30 overflow-hidden animate-fade-up" style={{ animationDelay: "120ms" }}>
          {allParticipants.map((p, i) => {
            const contribution = todayContributions.find((c) => c.participantId === p.id);
            const isPaid = contribution?.paye ?? false;
            return (
              <form
                key={p.id}
                action={togglePaid}
                className="flex justify-between items-center px-4 py-3 animate-fade-up"
                style={{ animationDelay: `${140 + i * 15}ms` }}
              >
                <input type="hidden" name="participantId" value={p.id} />
                {contribution && <input type="hidden" name="contributionId" value={contribution.id} />}
                <div className="flex items-center gap-3">
                  <NumeroBadge numero={p.numero} />
                  <span className="font-medium text-ink">{p.nom}</span>
                </div>
                <button
                  type="submit"
                  className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wide font-semibold transition-transform active:scale-90 ${
                    isPaid ? "bg-sage/20 text-sage border border-sage/40" : "bg-ink/5 text-ink/40 border border-ink/10"
                  }`}
                >
                  {isPaid ? "✓ Payé" : "Non payé"}
                </button>
              </form>
            );
          })}
        </div>
      </div>
    </div>
  );
}
