import InicioClient from "./InicioClient"

// Pesquisa INÍCIO (baseline) — aplicada no começo do encontro (dia 20).
// Rota separada: NÃO mexe em /pesquisa (Inscrição / QR do panfleto).
export const metadata = { title: "Pesquisa de entrada — Vozes da Quebrada" }

export default function InicioPage() {
  return <InicioClient />
}
