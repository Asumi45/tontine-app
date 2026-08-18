import { db } from "@/db";
import { participants, payouts } from "@/db/schema";
import { asc } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NumeroBadge } from "@/components/badge";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const allParticipants = await db.select().from(participants).orderBy(asc(participants.numero));
  const allPayouts = await db.select().from(payouts).orderBy(asc(payouts.dateVersement));
  const prochainPayout = allPayouts.find((p) => !p.verse);

  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <header className="flex justify-between items-start animate-fade-up">
          <div>
            <p className="text-xs uppercase tracking-widest text-sage font-mono mb-1">Tontine familiale</p>
            <h1 className="font-display text-2xl font-bold text-ink">Tableau de bord</h1>
          </div>
          <form action="/api/logout" method="post">
            <button className="text-xs text-coral font-mono uppercase tracking-wide hover:underline">Déconnexion</button>
          </form>
        </header>

        <nav className="flex gap-2 animate-fade-up" style={{ animationDelay: "60ms" }}>
          <a href="/cotisations" className="flex-1 text-center bg-gold/20 text-ink border border-gold/40 rounded-xl py-2.5 text-sm font-semibold hover:scale-[1.02] active:scale-[0.98] transition-transform">
            Cotisations
          </a>
          <a href="/retraits" className="flex-1 text-center bg-sage/20 text-ink border border-sage/40 rounded-xl py-2.5 text-sm font-semibold hover:scale-[1.02] active:scale-[0.98] transition-transform">
            Retraits
          </a>
        </nav>

        {prochainPayout && (
          <div
            className="rounded-2xl p-5 shadow-lg relative overflow-hidden text-ink bg-gradient-to-br from-gold via-rose to-coral animate-gradient animate-fade-up"
            style={{ animationDelay: "120ms" }}
          >
            <p className="text-xs uppercase tracking-widest opacity-70 font-mono">Prochain retrait</p>
            <p className="font-display text-2xl font-bold mt-1">
              {allParticipants.find((p) => p.id === prochainPayout.participantId)?.nom}
            </p>
            <p className="text-sm font-mono opacity-80 mt-1">
              {new Date(prochainPayout.dateVersement).toLocaleDateString("fr-FR")} · {prochainPayout.montant.toLocaleString("fr-FR")} Ar
            </p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow divide-y divide-rose/30 border border-rose/30 overflow-hidden animate-fade-up" style={{ animationDelay: "180ms" }}>
          <h2 className="px-4 py-3 font-mono text-xs uppercase tracking-widest text-ink/50">
            Participants · {allParticipants.length}
          </h2>
          {allParticipants.map((p, i) => {
            const payout = allPayouts.find((po) => po.participantId === p.id);
            return (
              <div
                key={p.id}
                className="flex justify-between items-center px-4 py-3 animate-fade-up"
                style={{ animationDelay: `${200 + i * 15}ms` }}
              >
                <div className="flex items-center gap-3">
                  <NumeroBadge numero={p.numero} />
                  <span className="font-medium text-ink">{p.nom}</span>
                </div>
                {payout && (
                  <span className="text-xs font-mono text-ink/40">
                    {new Date(payout.dateVersement).toLocaleDateString("fr-FR")}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
