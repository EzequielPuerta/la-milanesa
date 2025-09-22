export function splitTitleForMobile(
  title: string,
  isMobile: boolean
): string {
  if (!isMobile) return title;

  const words = title.split(' ');
  const n = words.length;

  if (n <= 6) return title;

  if (n <= 15) {
    const mid = Math.ceil(n / 2);
    const first = words.slice(0, mid).join(' ');
    const second = words.slice(mid).join(' ');
    return `${first}<br>${second}`;
  }

  // más de 20 palabras -> 3 líneas
  const third = Math.ceil(n / 3);
  const firstLine = words.slice(0, third).join(' ');
  const secondLine = words.slice(third, 2 * third).join(' ');
  const thirdLine = words.slice(2 * third).join(' ');
  return `${firstLine}<br>${secondLine}<br>${thirdLine}`;
}
