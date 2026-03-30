import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatConfidence(value: number): string {
  return `${Math.round(value * 100)}%`
}

export function getSpreadColor(level: string): string {
  switch (level) {
    case 'high': return 'text-ds-danger'
    case 'medium': return 'text-ds-warning'
    case 'low': return 'text-ds-success'
    default: return 'text-ds-text-secondary'
  }
}

export function getSpreadBg(level: string): string {
  switch (level) {
    case 'high': return 'bg-ds-danger-dim text-ds-danger'
    case 'medium': return 'bg-ds-warning-dim text-ds-warning'
    case 'low': return 'bg-ds-success-dim text-ds-success'
    default: return 'bg-ds-card text-ds-text-secondary'
  }
}

export function getNodeColor(type: string): string {
  const colors: Record<string, string> = {
    Topic: '#5B7BF8',
    Region: '#2DD4A0',
    Organization: '#F5A623',
    Person: '#EF5454',
    Platform: '#A78BFA',
    Event: '#F97316',
    // Sector-based colors (for real propagation graph)
    energy: '#F59E0B',
    aviation: '#3B82F6',
    insurance: '#8B5CF6',
    banking: '#10B981',
    logistics: '#F97316',
    exchange: '#6366F1',
    tourism: '#EC4899',
    utilities: '#EAB308',
    food_supply: '#84CC16',
    regulatory: '#EF4444',
    telecom: '#06B6D4',
    sovereign: '#14B8A6',
  }
  return colors[type] || '#5B7BF8'
}

export function getNodeGlowIntensity(weight: number): number {
  return Math.max(10, Math.round(weight * 50))
}
