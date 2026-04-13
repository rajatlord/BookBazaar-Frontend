export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr))
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getOrderStatusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'orange',
    CONFIRMED: 'blue',
    SHIPPED: 'geekblue',
    DELIVERED: 'green',
    CANCELLED: 'red',
    REFUNDED: 'purple',
  }
  return map[status] ?? 'default'
}

export function getBookStatusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING_VERIFICATION: 'orange',
    VERIFIED: 'green',
    REJECTED: 'red',
    UNLISTED: 'default',
  }
  return map[status] ?? 'default'
}

export function getShopStatusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'orange',
    ACTIVE: 'green',
    SUSPENDED: 'red',
    REJECTED: 'red',
  }
  return map[status] ?? 'default'
}