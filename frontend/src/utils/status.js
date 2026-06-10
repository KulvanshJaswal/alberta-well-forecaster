const STATUS_HEX = {
  green: '#00bb7f',
  red: '#ff6568',
  grey: '#a1a1a1',
};

export function statusCategory(status) {
  const s = (status || '').toLowerCase();
  if (s.includes('produc') || s.includes('active')) return 'green';
  if (s.includes('abandon') || s.includes('cancel')) return 'red';
  return 'grey';
}

export function statusColorClass(status) {
  return `status-${statusCategory(status)}`;
}

export function statusColorHex(status) {
  return STATUS_HEX[statusCategory(status)];
}
