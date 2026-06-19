import { headers } from "next/headers"
import PesquisaClient from "./PesquisaClient"

export const dynamic = "force-dynamic"

export default async function PesquisaPage() {
  await headers()
  return <PesquisaClient />
}
