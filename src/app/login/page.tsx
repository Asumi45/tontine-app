"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="h-2 w-full rounded-t-2xl overflow-hidden bg-gradient-to-r from-gold via-rose to-coral animate-gradient" />
        <form
          onSubmit={handleLogin}
          className="bg-white rounded-b-2xl shadow-xl p-8 space-y-5 border border-rose/40"
        >
          <div>
            <p className="text-xs uppercase tracking-widest text-sage font-mono mb-1">Tontine familiale</p>
            <h1 className="font-display text-3xl font-bold text-ink">Bon retour</h1>
          </div>

          {error && (
            <p className="text-sm text-coral bg-coral/10 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div>
            <label className="block text-xs font-medium text-ink/50 mb-1 uppercase tracking-wide">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-rose/50 px-3 py-2.5 font-sans focus:outline-none focus:ring-2 focus:ring-gold/50 transition-shadow"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink/50 mb-1 uppercase tracking-wide">Mot de passe</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-rose/50 px-3 py-2.5 font-sans focus:outline-none focus:ring-2 focus:ring-gold/50 transition-shadow"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gold py-2.5 text-ink font-semibold hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
