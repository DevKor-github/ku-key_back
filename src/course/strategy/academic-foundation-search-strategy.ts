import { SearchStrategy } from './search-strategy';

const ACADEMIC_FOUNDATION = 'Academic Foundations';

export class AcademicFoundationSearchStrategy implements SearchStrategy {
  supports(category: string): boolean {
    return category === ACADEMIC_FOUNDATION;
  }
}
