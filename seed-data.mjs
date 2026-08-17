import postgres from "postgres";
import { config } from "dotenv";
config({ path: ".env.local" });

const sql = postgres(process.env.DATABASE_URL);

// Données extraites du planning de tontine
const data = [
  { numero: 1, nom: "Dt Rajaona", debut: "2026-08-17" },
  { numero: 2, nom: "Tanjona (Mick)", debut: "2026-08-22" },
  { numero: 3, nom: "Josoa", debut: "2026-08-27" },
  { numero: 4, nom: "Hanitra", debut: "2026-09-01" },
  { numero: 5, nom: "Dt Liva", debut: "2026-09-06" },
  { numero: 6, nom: "Dt Nesta", debut: "2026-09-11" },
  { numero: 7, nom: "Finaritra", debut: "2026-09-16" },
  { numero: 8, nom: "Onja", debut: "2026-09-21" },
  { numero: 9, nom: "Mama Holy", debut: "2026-09-26" },
  { numero: 10, nom: "Mama Holy", debut: "2026-10-01" },
  { numero: 11, nom: "Jemima", debut: "2026-10-06" },
  { numero: 12, nom: "Rina", debut: "2026-10-11" },
  { numero: 13, nom: "Naina", debut: "2026-10-16" },
  { numero: 14, nom: "Sambatra", debut: "2026-10-21" },
  { numero: 15, nom: "Dt Barry", debut: "2026-10-26" },
  { numero: 16, nom: "Annick", debut: "2026-10-31" },
  { numero: 17, nom: "Naina", debut: "2026-11-05" },
  { numero: 18, nom: "Faniry", debut: "2026-11-10" },
  { numero: 19, nom: "Faniry", debut: "2026-11-15" },
  { numero: 20, nom: "Sambatra", debut: "2026-11-20" },
  { numero: 21, nom: "Onja", debut: "2026-11-25" },
  { numero: 22, nom: "Mino", debut: "2026-11-30" },
  { numero: 23, nom: "Donnah", debut: "2026-12-05" },
  { numero: 24, nom: "Daniel", debut: "2026-12-10" },
  { numero: 25, nom: "Mahery", debut: "2026-12-15" },
  { numero: 26, nom: "Nantenaina", debut: "2026-12-20" },
  { numero: 27, nom: "Hanitra", debut: "2026-12-25" },
  { numero: 28, nom: "Mick", debut: "2026-12-30" },
  { numero: 29, nom: "Patrick", debut: "2027-01-04" },
  { numero: 30, nom: "Onja", debut: "2027-01-09" },
  { numero: 31, nom: "Vero", debut: "2027-01-14" },
  { numero: 32, nom: "Jemima", debut: "2027-01-19" },
  { numero: 33, nom: "Dt Lava", debut: "2027-01-24" },
  { numero: 34, nom: "Hasina", debut: "2027-01-29" },
  { numero: 35, nom: "Vero", debut: "2027-02-03" },
  { numero: 36, nom: "Njaka", debut: "2027-02-08" },
  { numero: 37, nom: "Dt Nesta", debut: "2027-02-13" },
  { numero: 38, nom: "Rina", debut: "2027-02-18" },
  { numero: 39, nom: "Vero", debut: "2027-02-23" },
  { numero: 40, nom: "Finaritra", debut: "2027-02-28" },
];

const MONTANT_RETRAIT = 200000; // Ariary, tous les 5 jours
const MONTANT_COTISATION_JOUR = 1000; // Ariary, par jour

try {
  console.log("🚀 Insertion des participants...");
  const participantIds = {};

  for (const p of data) {
    const [row] = await sql`
      INSERT INTO participants (numero, nom)
      VALUES (${p.numero}, ${p.nom})
      RETURNING id
    `;
    participantIds[p.numero] = row.id;
    console.log(`✅ #${p.numero} - ${p.nom}`);
  }

  console.log("\n🚀 Insertion des payouts (dates de retrait)...");
  for (const p of data) {
    await sql`
      INSERT INTO payouts (participant_id, date_versement, montant, verse)
      VALUES (${participantIds[p.numero]}, ${p.debut}, ${MONTANT_RETRAIT}, false)
    `;
    console.log(`✅ Retrait #${p.numero} prévu le ${p.debut}`);
  }

  console.log(`\n🎉 ${data.length} participants et ${data.length} payouts créés avec succès !`);
} catch (err) {
  console.error("❌ Erreur:", err.message);
} finally {
  await sql.end();
}
