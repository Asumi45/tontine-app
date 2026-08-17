import { db } from "@/db";
import { participants, payouts } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function toggleVerse(formData: FormData) {
  "use server";

  const payoutId = Number(formData.get("payoutId"));

  const [current] = await db
    .select()
    .from(payouts)
    .where(eq(payouts.id, payoutId));

  await db
    .update(payouts)
    .set({ verse: !current.verse })
    .where(eq(payouts.id, payoutId));

  revalidatePath("/retraits");
}

export default async function RetraitsPage() {
  const today = new Date().toISOString().split("T")[0];

  const allParticipants = await db.select().from(participants);

  const allPayouts = await db
    .select()
    .from(payouts)
    .orderBy(asc(payouts.dateVersement));

  const verseCount = allPayouts.filter((p) => p.verse).length;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <header>
          <a href="/" className="text-sm text-blue-600">← Accueil</a>
          <h1 className="text-xl font-bold mt-1">Retraits</h1>
        </header>

        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Versés</p>
          <p className="text-2xl font-bold text-blue-600">
            {verseCount} / {allPayouts.length}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow divide-y">
          {allPayouts.map((payout) => {
            const participant = allParticipants.find(
              (p) => p.id === payout.participantId
            );
            const isPast = payout.dateVersement <= today;
            const isNext = !payout.verse && isPast;

            return (
              <form
                key={payout.id}
                action={toggleVerse}
                className={`flex justify-between items-center px-4 py-3 ${
                  isNext ? "bg-yellow-50" : ""
                }`}
              >
                <input type="hidden" name="payoutId" value={payout.id} />
                <div>
                  <span className="text-gray-400 text-sm mr-2">
                    #{participant?.numero}
                  </span>
                  <span className="font-medium">{participant?.nom}</span>
                  <p className="text-xs text-gray-500">
                    {new Date(payout.dateVersement).toLocaleDateString("fr-FR")} —{" "}
                    {payout.montant.toLocaleString("fr-FR")} Ar
                  </p>
                </div>
                <button
                  type="submit"
                  className={`px-3 py-1 rounded text-sm font-medium whitespace-nowrap ${
                    payout.verse
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
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
