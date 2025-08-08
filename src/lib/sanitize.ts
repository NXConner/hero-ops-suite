export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function safeHtml(strings: TemplateStringsArray, ...values: Array<string | number | undefined | null>) {
  const out: string[] = [];
  strings.forEach((chunk, i) => {
    out.push(chunk);
    if (i < values.length) {
      const v = values[i];
      out.push(typeof v === 'string' ? escapeHtml(v) : String(v))
    }
  });
  return out.join('');
}