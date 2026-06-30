// Mapeia um valor da escala 1–5 pra coordenada x dentro do plot [x0, x1].
export function xScale(value: number, x0: number, x1: number, min = 1, max = 5): number {
  const t = (value - min) / (max - min)
  return x0 + Math.max(0, Math.min(1, t)) * (x1 - x0)
}

export const TICKS_15 = [1, 2, 3, 4, 5]
