export function formatCreditsBalance(
  balance: number,
  locale: string,
): string {
  const intlLocale = locale === 'pl' ? 'pl-PL' : 'en-US';
  return new Intl.NumberFormat(intlLocale).format(Math.max(0, balance));
}
