import { db } from "@/db";
import { participants, payouts } from "@/db/schema";
import { asc } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const allParticipants = await db
    .select()
    .from(participants)
    .orderBy(asc(participants.numero));

  const allPayouts = await db
    .select()
    .from(payouts)
    .orderBy(asc(payouts.dateVersement));

  const today = new Date().toISOString().split("T")[0];

  // Trouve le prochain retrait (le premier non versé, à venir ou en cours)
  const prochainPayout = allPayouts.find((p) => !p.verse);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Tontine Familiale</h1>
          <div className="flex items-center gap-3">
            <a href="/cotisations" className="text-sm text-blue-600">Cotisations</a>
            <a href="/retraits" className="text-sm text-blue-600">Retraits</a>
            <form action="/api/logout" method="post">
              <button className="text-sm text-red-600">Déconnexion</button>
            </form>
          </div>
        </header>

        {prochainPayout && (
          <div className="bg-blue-600 text-white rounded-lg p-4 shadow">
            <p className="text-sm opacity-90">Prochain retrait</p>
            <p className="text-lg font-bold">
              {allParticipants.find((p) => p.id === prochainPayout.participantId)?.nom}
            </p>
            <p className="text-sm opacity-90">
              {new Date(prochainPayout.dateVersement).toLocaleDateString("fr-FR")} —{" "}
              {prochainPayout.montant.toLocaleString("fr-FR")} Ar
            </p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow divide-y">
          <h2 className="px-4 py-3 font-semibold text-sm text-gray-500">
            Liste des participants ({allParticipants.length})
          </h2>
          {allParticipants.map((p) => {
            const payout = allPayouts.find((po) => po.participantId === p.id);
            return (
              <div
                key={p.id}
                className="flex justify-between items-center px-4 py-3"
              >
                <div>
                  <span className="text-gray-400 text-sm mr-2">#{p.numero}</span>
                  <span className="font-medium">{p.nom}</span>
                </div>
                {payout && (
                  <span className="text-xs text-gray-500">
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
