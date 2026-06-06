/**
 * Símbolo da marca Vozes do Oziel — balão de fala partido em grafite/laranja
 * com o gesto de deslize ‹ › no miolo. Espelha public/brand/logo.svg.
 * Variantes conforme o guia: cor (padrão), mono, inverso.
 */
interface LogoProps {
  size?: number
  variant?: "cor" | "mono" | "inverso"
  className?: string
}

export default function Logo({ size = 56, variant = "cor", className }: LogoProps) {
  const fill = variant === "mono" ? "#13130E" : "#EA5B1E"
  const split = variant === "inverso" ? "#F7F1E6" : "#1C1C1E"
  const eye = variant === "mono" ? "#13130E" : "#F7F1E6"
  const arrowL = variant === "mono" ? "#F7F1E6" : "#EA5B1E"
  const arrowR = variant === "mono" ? "#F7F1E6" : "#1C1C1E"

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      className={className}
      role="img"
      aria-label="Vozes do Oziel"
    >
      <defs>
        <clipPath id="logo-bub">
          <rect x="34" y="28" width="188" height="152" rx="60" />
          <path d="M 80 168 L 120 172 L 70 218 Z" />
        </clipPath>
      </defs>
      <g clipPath="url(#logo-bub)">
        <rect x="0" y="0" width="256" height="256" fill={fill} />
        <path d="M 132 18 C 112 70, 148 122, 128 204 L 256 256 L 256 0 Z" fill={split} />
      </g>
      <circle cx="124" cy="100" r="38" fill={eye} />
      <polyline
        points="121,82 101,100 121,118"
        fill="none"
        stroke={arrowL}
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="127,82 147,100 127,118"
        fill="none"
        stroke={arrowR}
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
