import { pgTable, serial, integer, text, date, boolean, timestamp } from "drizzle-orm/pg-core";

export const participants = pgTable("participants", {
  id: serial("id").primaryKey(),
  numero: integer("numero").notNull(),
  nom: text("nom").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contributions = pgTable("contributions", {
  id: serial("id").primaryKey(),
  participantId: integer("participant_id").notNull().references(() => participants.id),
  date: date("date").notNull(),
  montant: integer("montant").notNull(),
  paye: boolean("paye").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const payouts = pgTable("payouts", {
  id: serial("id").primaryKey(),
  participantId: integer("participant_id").notNull().references(() => participants.id),
  dateVersement: date("date_versement").notNull(),
  montant: integer("montant").notNull(),
  verse: boolean("verse").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});
