import postgres from "postgres";
import { config } from "dotenv";
config({ path: ".env.local" });

const sql = postgres(process.env.DATABASE_URL);

// Dates de retrait correctes = FIN DE TOUR + 1 jour (issu du planning original)
const retraits = [
  { numero: 1, date: "2026-08-22" },
  { numero: 2, date: "2026-08-27" },
  { numero: 3, date: "2026-09-01" },
  { numero: 4, date: "2026-09-06" },
  { numero: 5, date: "2026-09-11" },
  { numero: 6, date: "2026-09-16" },
  { numero: 7, date: "2026-09-21" },
  { numero: 8, date: "2026-09-26" },
  { numero: 9, date: "2026-10-01" },
  { numero: 10, date: "2026-10-06" },
  { numero: 11, date: "2026-10-11" },
  { numero: 12, date: "2026-10-16" },
  { numero: 13, date: "2026-10-21" },
  { numero: 14, date: "2026-10-26" },
  { numero: 15, date: "2026-10-31" },
  { numero: 16, date: "2026-11-05" },
  { numero: 17, date: "2026-11-10" },
  { numero: 18, date: "2026-11-15" },
  { numero: 19, date: "2026-11-20" },
  { numero: 20, date: "2026-11-25" },
  { numero: 21, date: "2026-11-30" },
  { numero: 22, date: "2026-12-05" },
  { numero: 23, date: "2026-12-10" },
  { numero: 24, date: "2026-12-15" },
  { numero: 25, date: "2026-12-20" },
  { numero: 26, date: "2026-12-25" },
  { numero: 27, date: "2026-12-30" },
  { numero: 28, date: "2027-01-04" },
  { numero: 29, date: "2027-01-09" },
  { numero: 30, date: "2027-01-14" },
  { numero: 31, date: "2027-01-19" },
  { numero: 32, date: "2027-01-24" },
  { numero: 33, date: "2027-01-29" },
  { numero: 34, date: "2027-02-03" },
  { numero: 35, date: "2027-02-08" },
  { numero: 36, date: "2027-02-13" },
  { numero: 37, date: "2027-02-18" },
  { numero: 38, date: "2027-02-23" },
  { numero: 39, date: "2027-02-28" },
  { numero: 40, date: "2027-03-05" },
];

try {
  for (const r of retraits) {
    const [participant] = await sql`
      SELECT id FROM participants WHERE numero = ${r.numero}
    `;

    if (!participant) {
      console.log(`⚠️ Participant #${r.numero} introuvable, skip`);
      continue;
    }

    await sql`
      UPDATE payouts
      SET date_versement = ${r.date}
      WHERE participant_id = ${participant.id}
    `;
    console.log(`✅ #${r.numero} → retrait corrigé au ${r.date}`);
  }
  console.log("\n🎉 Toutes les dates de retrait ont été corrigées !");
} catch (err) {
  console.error("❌ Erreur:", err.message);
} finally {
  await sql.end();
}
