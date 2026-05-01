/**
 * Levenshtein Distance for Intelligent FAQ Matching.
 * Measures the difference between two strings to allow fuzzy searching.
 */
export class StringSimilarity {
  /**
   * Computes the Levenshtein distance between two strings.
   */
  public static levenshtein(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  /**
   * Returns a similarity score between 0 and 1.
   * 1.0 = exact match, 0.0 = completely different.
   */
  public static score(a: string, b: string): number {
    const cleanA = a.toLowerCase().trim();
    const cleanB = b.toLowerCase().trim();
    
    if (cleanA === cleanB) return 1.0;
    
    const distance = this.levenshtein(cleanA, cleanB);
    const maxLength = Math.max(cleanA.length, cleanB.length);
    
    if (maxLength === 0) return 1.0;
    return 1.0 - distance / maxLength;
  }
}
