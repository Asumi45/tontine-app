import { db } from "@/db";
import { participants, contributions } from "@/db/schema";
import { asc, eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const MONTANT_JOUR = 1000; // Ariary

async function togglePaid(formData: FormData) {
  "use server";

  const participantId = Number(formData.get("participantId"));
  const contributionId = formData.get("contributionId");
  const today = new Date().toISOString().split("T")[0];

  if (contributionId) {
    // Existe déjà → on inverse le statut payé
    const [current] = await db
      .select()
      .from(contributions)
      .where(eq(contributions.id, Number(contributionId)));

    await db
      .update(contributions)
      .set({ paye: !current.paye })
      .where(eq(contributions.id, Number(contributionId)));
  } else {
    // N'existe pas encore → on crée la ligne comme payée
    await db.insert(contributions).values({
      participantId,
      date: today,
      montant: MONTANT_JOUR,
      paye: true,
    });
  }

  revalidatePath("/cotisations");
}

export default async function CotisationsPage() {
  const today = new Date().toISOString().split("T")[0];

  const allParticipants = await db
    .select()
    .from(participants)
    .orderBy(asc(participants.numero));

  const todayContributions = await db
    .select()
    .from(contributions)
    .where(eq(contributions.date, today));

  const payesCount = todayContributions.filter((c) => c.paye).length;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <header>
          <a href="/" className="text-sm text-blue-600">← Accueil</a>
          <h1 className="text-xl font-bold mt-1">Cotisations du jour</h1>
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </header>

        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Payé aujourd'hui</p>
          <p className="text-2xl font-bold text-green-600">
            {payesCount} / {allParticipants.length}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow divide-y">
          {allParticipants.map((p) => {
            const contribution = todayContributions.find(
              (c) => c.participantId === p.id
            );
            const isPaid = contribution?.paye ?? false;

            return (
              <form
                key={p.id}
                action={togglePaid}
                className="flex justify-between items-center px-4 py-3"
              >
                <input type="hidden" name="participantId" value={p.id} />
                {contribution && (
                  <input
                    type="hidden"
                    name="contributionId"
                    value={contribution.id}
                  />
                )}
                <div>
                  <span className="text-gray-400 text-sm mr-2">#{p.numero}</span>
                  <span className="font-medium">{p.nom}</span>
                </div>
                <button
                  type="submit"
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    isPaid
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
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
