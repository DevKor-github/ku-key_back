import { ItemCategory } from 'src/enums/item-category.enum';

export const RequiredPoints = {
  [ItemCategory.COURSE_REVIEW_READING_TICKET]: {
    3: 30,
    7: 50,
    30: 100,
  },
  [ItemCategory.CHARACTER_EVOLUTION]: {
    2: 30,
    3: 100,
    4: 200,
    5: 300,
    6: 400,
  },
  [ItemCategory.CHARACTER_TYPE_CHANGE]: 200,
} as const;

// 타입 추출
export type RequiredPoints =
  (typeof RequiredPoints)[keyof typeof RequiredPoints];
