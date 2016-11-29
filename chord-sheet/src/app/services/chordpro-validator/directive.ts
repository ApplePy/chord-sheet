/**
 * Created by Darryl on 2016-11-26.
 */

/**
 * A class for handling parsing of ChordPro directives and storing the resulting data.
 */
export class Directive {
  constructor(public contents: string, public directive: string, public value?: string) { };

  /** Takes a string that could be a directive and parses out the data of the directive.
   *
   * @param input The input string to be parsed.
   * @returns {Directive | null}
   */
  static extractDirective(input: string): Directive {
    // Get start and end of directive
    let start = input.indexOf('{');
    let end = input.indexOf('}');

    if (start === -1 && end === -1) return null;    // No directive found

    if (start === 0 && end === input.length - 1) {  // Valid directive brackets found
      // Get separator and value
      let val: string = null;
      let separator = input.indexOf(':');

      // If this a directive-only tag, move the separator to the end
      if (separator === -1) separator = end;
      // Get value
      else val = input.substr(separator + 1, end - 1 - separator).trim();

      // Create parsed object and return
      return new Directive(
        input.substr(start, end - start + 1).trim(),
        input.substr(start + 1, separator - start - 1).trim(),
        val);
    }
    else {    // Malformed directive brackets
      // If bracket missing
      if(start === -1 || end === -1) throw new Error("Error: Missing bracket.");
      // If start in wrong place
      else if (start !== 0) throw new Error("Error: Starting curly brace anywhere other than at the start of the line.");
      // If end is in wrong place
      else if (end !== input.length - 1) throw new Error("Error: Ending curly brace anywhere other than at the end of the line (after removing whitespace).");
      // Miscellaneous error
      else throw new Error("Error: Undefined directive parsing error.");
    }
  }
}
