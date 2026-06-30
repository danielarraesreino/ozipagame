import AvaliacaoClient from "./AvaliacaoClient"

// Pesquisa FIM — aplicada DEPOIS do encontro (dia 20). Rota separada de propósito:
// NÃO mexe em /pesquisa (que é a Inscrição, impressa no QR do panfleto).
export const metadata = { title: "Avaliação — Vozes da Quebrada" }

export default function AvaliacaoPage() {
  return <AvaliacaoClient />
}
