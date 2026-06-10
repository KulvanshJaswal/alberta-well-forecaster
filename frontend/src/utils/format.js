export function formatLicensee(name) {
  return (name || '').replace(/\s*\([^)]*\)\s*$/, '').trim();
}
