interface TimezoneSelectProps {
  value: string
  onChange: (timezone: string) => void
  disabled?: boolean
}

const TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (New York)' },
  { value: 'America/Chicago', label: 'Central Time (Chicago)' },
  { value: 'America/Denver', label: 'Mountain Time (Denver)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (Los Angeles)' },
  { value: 'Europe/London', label: 'GMT (London)' },
  { value: 'Europe/Paris', label: 'Central European (Paris)' },
  { value: 'Europe/Berlin', label: 'Central European (Berlin)' },
  { value: 'Asia/Tokyo', label: 'Japan (Tokyo)' },
  { value: 'Asia/Shanghai', label: 'China (Shanghai)' },
  { value: 'Asia/Singapore', label: 'Singapore' },
  { value: 'Australia/Sydney', label: 'Australia (Sydney)' },
]

export function TimezoneSelect({ value, onChange, disabled }: TimezoneSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full px-4 py-3 bg-system-panel border border-system-border rounded
                 text-system-text focus:border-system-blue focus:outline-none
                 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {TIMEZONES.map((tz) => (
        <option key={tz.value} value={tz.value} className="bg-system-panel">
          {tz.label}
        </option>
      ))}
    </select>
  )
}
