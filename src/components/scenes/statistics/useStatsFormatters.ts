import { useTranslation } from '@/i18n';

export function useStatsFormatters() {
  const { t, language } = useTranslation();
  const e = t.encyclopedia;

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}${e.statsHourLabel} ${minutes % 60}${e.statsMinLabel}`;
    if (minutes > 0) return `${minutes}${e.statsMinLabel} ${seconds % 60}${e.statsSecLabel}`;
    return `${seconds}${e.statsSecLabel}`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(language, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return { formatDuration, formatDate, e };
}
