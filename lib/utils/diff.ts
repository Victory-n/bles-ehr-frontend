export interface DiffChunk {
  value: string;
  added?: boolean;
  removed?: boolean;
}

/**
 * Computes a word-by-word diff between oldText and newText using the
 * Longest Common Subsequence (LCS) algorithm.
 */
export function computeDiff(oldText: string, newText: string): DiffChunk[] {
  const cleanOld = oldText || "";
  const cleanNew = newText || "";

  if (!cleanOld && !cleanNew) return [];
  if (!cleanOld) return [{ value: cleanNew, added: true }];
  if (!cleanNew) return [{ value: cleanOld, removed: true }];

  // Split by words and capture whitespace so the layout is preserved
  const oldWords = cleanOld.split(/(\s+)/).filter(Boolean);
  const newWords = cleanNew.split(/(\s+)/).filter(Boolean);

  const dp: number[][] = Array(oldWords.length + 1)
    .fill(null)
    .map(() => Array(newWords.length + 1).fill(0));

  for (let i = 1; i <= oldWords.length; i++) {
    for (let j = 1; j <= newWords.length; j++) {
      if (oldWords[i - 1] === newWords[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const chunks: DiffChunk[] = [];
  let i = oldWords.length;
  let j = newWords.length;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldWords[i - 1] === newWords[j - 1]) {
      chunks.unshift({ value: oldWords[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      chunks.unshift({ value: newWords[j - 1], added: true });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      chunks.unshift({ value: oldWords[i - 1], removed: true });
      i--;
    }
  }

  return chunks;
}
