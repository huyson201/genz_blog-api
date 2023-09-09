function parseTimePart(part) {
  const match = part.match(/^(\d+)([dhms])$/);

  if (!match) {
    throw new Error('Invalid time part format');
  }

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 'd':
      return value * 24 * 60 * 60 * 1000; // Ngày thành mili giây
    case 'h':
      return value * 60 * 60 * 1000; // Giờ thành mili giây
    case 'm':
      return value * 60 * 1000; // Phút thành mili giây
    case 's':
      return value * 1000; // Giây thành mili giây
    default:
      throw new Error('Unknown time unit');
  }
}

export default parseTimePart;
