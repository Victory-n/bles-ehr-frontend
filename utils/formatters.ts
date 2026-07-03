/**
 * Converts basic Markdown text into clean, styled plain text
 * suitable for rendering in textareas and plain-text editors.
 */
export function cleanMarkdownToPlainText(markdown: string): string {
  if (!markdown) return "";

  // Split content by lines to process them sequentially
  const lines = markdown.split(/\r?\n/);
  const processedLines = lines.map((line) => {
    const trimmed = line.trim();

    // 1. Convert headers: e.g. ### Subjective -> SUBJECTIVE followed by a separator line
    const headerMatch = trimmed.match(/^#{1,6}\s+(.+)$/);
    if (headerMatch) {
      let headerText = headerMatch[1].trim();
      // Remove any leading "SECTION 1:" or "SECTION 1 -" style prefixes case-insensitively
      headerText = headerText.replace(/^section\s+\d+\s*[:.-]?\s*/i, "");
      headerText = headerText.trim().toUpperCase();
      return `\n${headerText}\n${"-".repeat(Math.max(20, headerText.length))}`;
    }

    // 2. Normalize lists
    // Check for checklist items like: - [ ] Option or - [x] Option
    const checklistMatch = trimmed.match(/^[-*]\s+\[([ xX])\]\s+(.+)$/);
    if (checklistMatch) {
      const checked = checklistMatch[1].toLowerCase() === 'x' ? '[x]' : '[ ]';
      return `• ${checked} ${checklistMatch[2].trim()}`;
    }

    // Check for standard bullet points: - Item or * Item
    const bulletMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (bulletMatch) {
      // Don't match horizontal rules like --- or ***
      if (!trimmed.match(/^[-*]{3,}$/)) {
        return `• ${bulletMatch[1].trim()}`;
      }
    }

    // 3. Horizontal rules - remove them completely
    if (trimmed.match(/^[-*_=]{3,}$/)) {
      return "";
    }

    return line;
  });

  let text = processedLines.join("\n");

  // 4. Remove bold syntax: **text** or __text__
  text = text.replace(/\*\*([^*]+)\*\*/g, "$1");
  text = text.replace(/__([^_]+)__/g, "$1");

  // 5. Remove italic syntax: *text* or _text_
  text = text.replace(/\*([^*]+)\*/g, "$1");
  text = text.replace(/_([^_]+)_/g, "$1");

  // 6. Clean up extra empty lines (max 2 consecutive newlines)
  text = text.replace(/\n{3,}/g, "\n\n");

  return text.trim();
}
