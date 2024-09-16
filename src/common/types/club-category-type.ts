export const ClubCategory = [
  'Performing Arts',
  'Academic Research',
  'Sports',
  'Religious',
  'Exhibition & Creative Writing',
  'Humanities',
  'Living Culture',
  'Social',
  'Instrumental Arts',
] as const;

export type ClubCategory = (typeof ClubCategory)[number];
