/**
 * Return true when remark-math may need to parse the document.
 *
 * Valid remark-math expressions may contain whitespace or newlines. Any
 * unescaped dollar therefore opts into the parser; a currency false-positive
 * only changes loading cost, while a false-negative would render a formula raw.
 */
export function containsMath(content: string): boolean {
  for (
    let index = content.indexOf("$");
    index !== -1;
    index = content.indexOf("$", index + 1)
  ) {
    let slashCount = 0;
    for (
      let cursor = index - 1;
      cursor >= 0 && content[cursor] === "\\";
      cursor--
    ) {
      slashCount++;
    }
    if (slashCount % 2 === 0) return true;
  }
  return false;
}
