import type { Metadata } from "next"
import Link from "next/link"
import Logo from "@/components/Logo"
import MenuHamburger from "@/components/MenuHamburger"

export const metadata: Metadata = {
  title: "A equipe · Vozes da Quebrada",
  description:
    "Grupo Diálogos — as sete pessoas por trás do Vozes da Quebrada. Formado no CriaLab da Minha Campinas.",
}

const equipe = [
  {
    nome: "Flávio",
    papel: "Facilitador",
    desc: "Garante que o grupo siga a metodologia CriaLab e cumpra os prazos de cada etapa.",
  },
  {
    nome: "Ricardo",
    papel: "Registro",
    desc: "Mantém as fichas preenchidas e a ficha de acompanhamento atualizada. Também articula parcerias com escolas do Oziel.",
  },
  {
    nome: "Valéria",
    papel: "Mobilizadora",
    desc: "Garante engajamento, lembra reuniões e cuida da integração do grupo.",
  },
  {
    nome: "Stefane",
    papel: "Comunicadora",
    desc: "Registro audiovisual e divulgação. Conduz parcerias com escolas e a OZipa no território.",
  },
  {
    nome: "Lusi",
    papel: "Resp. Fundo Semente",
    desc: "Recebe o recurso, faz transferências, guarda comprovantes e sobe a prestação de contas.",
  },
  {
    nome: "Daniel",
    papel: "Execução",
    desc: "Foco em colocar o projeto em prática. Conduz a frente técnica do jogo.",
  },
]

// Quem caminha junto fora do Grupo Diálogos: educadores sociais que conduzem a
// ação no território + apoio da MCps. (bios de Gabriel, Biula e Fabi chegando)
const parceria = [
  {
    nome: "Gabriel",
    papel: "Educador social",
    desc: "Linha de frente no território: puxa o corre com a molecada e conduz a ação na hora H. (perfil completo chegando)",
  },
  {
    nome: "Biula",
    papel: "Educador social",
    desc: "Junto no chão da quebrada: comanda o rolê no dia da ação e segura a galera. (perfil completo chegando)",
  },
  {
    nome: "Elisa",
    papel: "Apoio · MCps",
    desc: "Socióloga e psicanalista. Acredita que se mobilizar junto por um mundo melhor é rolê de todo mundo — não de uns poucos.",
  },
  {
    nome: "Fabi",
    papel: "Apoio · MCps",
    desc: "Apoio do time da MCps no território. (perfil chegando)",
  },
]

export default function EquipePage() {
  return (
    <main className="bg-halftone bg-halftone-veil min-h-full">
      <div className="relative z-10 min-h-full px-6 py-10 max-w-md mx-auto">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            <Logo size={40} variant="cor" />
            <h1 className="brand-lockup text-creme text-3xl leading-none">
              A<br /><span className="text-laranja">equipe</span>
            </h1>
          </div>
          <MenuHamburger />
        </div>

        <p className="brand-label text-laranja text-[11px] mb-2">
          Grupo Diálogos — sete pessoas
        </p>
        <p className="text-creme-soft text-base leading-relaxed mb-7 max-w-[40ch]">
          Formado na imersão presencial de 16 de maio de 2026, no CriaLab da
          Minha Campinas.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {equipe.map((m) => (
            <div
              key={m.nome}
              className="bg-grafite-2 border-2 border-grafite-3 rounded-2xl p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="w-10 h-10 shrink-0 rounded-full bg-laranja text-grafite brand-lockup text-xl flex items-center justify-center leading-none">
                  {m.nome[0]}
                </span>
                <div>
                  <p className="text-creme font-bold text-base leading-tight">{m.nome}</p>
                  <p className="brand-label text-[10px] text-laranja">{m.papel}</p>
                </div>
              </div>
              <p className="text-creme-soft text-sm leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-grafite-2 border-2 border-laranja/40 rounded-2xl p-4 mt-3">
          <p className="brand-label text-[10px] text-laranja mb-1">Criadoras de Solução</p>
          <p className="text-creme-soft text-sm leading-relaxed">
            Papel compartilhado por todo o grupo: planejar, executar e testar a
            solução junto com os jovens do território.
          </p>
        </div>

        <p className="brand-label text-laranja text-[11px] mt-8 mb-2">
          Quem caminha junto
        </p>
        <p className="text-creme-soft text-base leading-relaxed mb-4 max-w-[40ch]">
          Educadores sociais que conduzem a ação no território e o apoio da MCps.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {parceria.map((m) => (
            <div
              key={m.nome}
              className="bg-grafite-2 border-2 border-grafite-3 rounded-2xl p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="w-10 h-10 shrink-0 rounded-full bg-laranja text-grafite brand-lockup text-xl flex items-center justify-center leading-none">
                  {m.nome[0]}
                </span>
                <div>
                  <p className="text-creme font-bold text-base leading-tight">{m.nome}</p>
                  <p className="brand-label text-[10px] text-laranja">{m.papel}</p>
                </div>
              </div>
              <p className="text-creme-soft text-sm leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="brand-stamp text-[11px] text-laranja underline">
            ← voltar pro início
          </Link>
        </div>
      </div>
    </main>
  )
}
