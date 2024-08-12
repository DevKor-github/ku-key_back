export function isConflictingTime(
  existingStartTime: string,
  existingEndTime: string,
  newStartTime: string,
  newEndTime: string,
): boolean {
  const timeToNumber = (time: string): number => {
    const [hours, minutes, seconds] = time.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };
  const existingStart = timeToNumber(existingStartTime);
  const existingEnd = timeToNumber(existingEndTime);
  const newStart = timeToNumber(newStartTime);
  const newEnd = timeToNumber(newEndTime);

  return (
    (newStart >= existingStart && newStart < existingEnd) ||
    (newEnd > existingStart && newEnd <= existingEnd) ||
    (newStart <= existingStart && newEnd >= existingEnd)
  );
}
