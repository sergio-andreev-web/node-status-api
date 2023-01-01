import { readFile } from 'node:fs/promises';
const lines = (await readFile(new URL('./requests.jsonl', import.meta.url), 'utf8')).trim().split('\n');
for (const line of lines) {
  const response = await fetch('http://localhost:3000/echo', { method: 'POST', body: line });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
}
console.log(`Replayed ${lines.length} sample requests`);
