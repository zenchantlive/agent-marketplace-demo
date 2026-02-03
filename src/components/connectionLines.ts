export function shouldDrawLine(state1: string, state2: string) {
  return state1 === 'communicating' && state2 === 'communicating'
}

export function getLineColor(state: string) {
  if (state === 'communicating') return '#3b82f6'
  return 'transparent'
}
