import { SearchStrategy } from './search-strategy';

const MAJOR = 'Major';

export class MajorSearchStrategy implements SearchStrategy {
  supports(category: string): boolean {
    return category === MAJOR;
  }
}
