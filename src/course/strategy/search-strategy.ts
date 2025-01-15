export interface SearchStrategy {
  supports(category: string): boolean;
}
