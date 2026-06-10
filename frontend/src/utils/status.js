const STATUS_HEX = {
  green: '#00bb7f',
  red: '#ff6568',
  yellow: '#f99c00',
  grey: '#a1a1a1',
};

export function statusCategory(status) {
  const s = (status || '').toLowerCase();
  if (s.includes('active') || s.includes('produc') || s.includes('pump')) return 'green';
  if (s.includes('abd') || s.includes('abandon') || s.includes('cancel')) return 'red';
  if (s.includes('susp')) return 'yellow';
  return 'grey';
}

export function statusColorClass(status) {
  return `status-${statusCategory(status)}`;
}

export function statusColorHex(status) {
  return STATUS_HEX[statusCategory(status)];
}
