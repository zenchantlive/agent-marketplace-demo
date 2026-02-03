export function truncateMessage(msg: string, limit = 20) {
  if (msg.length <= limit) return msg
  return msg.substring(0, limit) + '...'
}

export function shouldShowBubble(state: string) {
  return state === 'communicating'
}
