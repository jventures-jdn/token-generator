export type EditContentType = 'TEXT' | 'LINE' | 'RANGE' | 'REPLACE';

export default class ContentManagement {
  /**
   * Edits the content based on the specified type and pattern.
   * @param content - The original content to be edited.
   * @param type - The type of edit to be performed ('LINE', 'RANGE', or 'REPLACE').
   * @param pattern - The pattern used to identify the content to be edited.
   * @returns The edited content.
   */
  static editContent(
    content: string,
    type: EditContentType,
    pattern: string,
    newValue?: string,
  ) {
    // remove content line by line
    if (type === 'LINE') {
      return content
        .split('\n')
        .filter((line) => !line.includes(`@${pattern}`))
        .join('\n');
    }

    // remove content in pattern range
    if (type === 'RANGE') {
      const lines = content.split('\n');
      const removeLines = lines.reduce((acc, line, index) => {
        // start with `@start_xxx`
        if (line.includes(`@start_${pattern}`)) {
          acc.push(index);
        }
        // end with `@end_xxx`
        if (line.includes(`@end_${pattern}`)) {
          const prevStartLine = acc[acc.length - 1];
          Array(index - prevStartLine)
            .fill(0)
            .map((_, i) => acc.push(prevStartLine + i + 1));
        }
        return acc;
      }, [] as number[]);
      return lines
        .filter((_, index) => !removeLines.includes(index))
        .join('\n');
    }

    // replace content in pattern range
    if (type === 'REPLACE') {
      const lines = content.split('\n');
      const newContractRaw = lines.reduce(
        (acc, line) => {
          // start with `@start_replace_xxx`
          if (line.includes(`@start_replace_${pattern}`)) {
            acc.inRange = true;
          }

          // capture replace content inside blacket of pattern `@start_replace_xxx[replace_content]`
          if (acc.inRange === true) {
            if (line.includes(`_${pattern}[`)) {
              acc.replace = line
                .match(/\[(.*?)]/g)
                .toString()
                .replaceAll('[', '')
                .replaceAll(']', '');
            }
            acc.new.push(line.replaceAll(acc.replace, newValue || ''));
          } else {
            acc.new.push(line);
          }

          // end with `@end_replace_xxx`
          if (line.includes(`@end_replace_${pattern}`)) {
            acc.inRange = false;
            acc.replace = undefined;
          }

          return acc;
        },
        { inRange: false, new: [] as string[], replace: undefined },
      );
      return newContractRaw.new.join('\n');
    }
  }

  static cleanContent(content: string) {
    function replaceWordsWithEmpty(text: string, words: string[]) {
      // Create a regular expression pattern to match any of the words in the list
      const bracketPattern = /\[([^\]]+)\]/g;
      const pattern = new RegExp(
        '// @' + '\\b(?:' + words.join('|') + ')\\b',
        'gi',
      );

      // Replace the matched words with an empty string
      const replacedText = text
        .replaceAll(pattern, '')
        .replaceAll(bracketPattern, '');

      return replacedText;
    }

    const patterns = [
      'pause',
      'supplyCap',
      'adminTransfer',
      'adminBurn',
      'burn',
      'mint',
      'decimals',
      'selfBurn',
    ];

    const types = ['', 'start_', 'end_', 'start_replace_', 'end_replace_'];

    const replacePatterns = types.reduce((acc, type) => {
      patterns.forEach((pattern) => {
        acc.push(`${type}${pattern}`);
      });
      return acc;
    }, []);

    return replaceWordsWithEmpty(content, replacePatterns);
  }
}
