import { SearchStrategy } from './search-strategy';

const GENERAL = 'General Studies';

export class GeneralSearchStrategy implements SearchStrategy {
  supports(category: string): boolean {
    return category === GENERAL;
  }
}
