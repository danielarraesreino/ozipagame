import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// Cliente Supabase SOMENTE de servidor (service role). Nunca importar em
// componente client. Usa a service role key → ignora RLS; toda validação e
// anonimização acontece nas rotas de API. Lazy: só conecta quando chamado,
// pra build não quebrar sem env.
let client: SupabaseClient | null = null

export function supa(): SupabaseClient {
  if (client) return client
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      "Supabase não configurado — defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.",
    )
  }
  client = createClient(url, key, { auth: { persistSession: false } })
  return client
}
