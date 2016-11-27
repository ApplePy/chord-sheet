import { Directive } from "./directive";
import {ChordProValidatorOutput } from "./chordpro-validator-output";
import { DirectiveDefinition } from "./directive-definition";
import { isNullOrUndefined } from "util";

/**
 * This service verifies ChordPro data.
 */
export class ChordproValidatorService {

  private readonly extra_chars_func = function(input: Directive, definition: DirectiveDefinition, output: ChordProValidatorOutput): boolean {
    // Check definition directives to see if they are substrings of the input directive.
    for (let def of definition.directives) {

      // This is a soc with extra characters
      if (input.directive.indexOf(def) != -1) {
        output.errors.push("Error: Extra characters for “soc”, “eoc”, “sot” or “eot” directives.");
        return false;
      }
    }
    return false;
  };

  acceptableDirectives: DirectiveDefinition[] =
  [
    new DirectiveDefinition(["new_song","ns"], false, null, true, ["new_song", "ns"]),
    new DirectiveDefinition(["title",  "t"], /.*/, "Error: Missing separator (“:”) or text for “title”, “subtitle”, “comment” or “define” directives.", true, false, false,
      // Stack Function
      function(stack: Directive[], definition: DirectiveDefinition, output: ChordProValidatorOutput) {
        let foundOnce = false;
        for (let item of stack) {
          // If a title directive has been found
          if (definition.directives.indexOf(item.directive) == 0) {
            // If a title hasn't been seen, mark that one has. If another title is seen after, flag error.
            if (!foundOnce) {
              foundOnce = true;
            }else {
              output.errors.push("Error: More than one “title” directive within the same “new_song” block.");
              break;
            }
          }
        }
      }),
    new DirectiveDefinition(["subtitle", "st"], /.*/, "Error: Missing separator (“:”) or text for “title”, “subtitle”, “comment” or “define” directives.", false, false),
    new DirectiveDefinition(["comment", "c"], /.*/, "Error: Missing separator (“:”) or text for “title”, “subtitle”, “comment” or “define” directives.", false, false),
    new DirectiveDefinition(["start_of_chorus", "soc"], false, null, true, false, false, null, null, null, null,
      // Directive No Match Function
      this.extra_chars_func),
    new DirectiveDefinition(["end_of_chorus", "eoc"], false, null, false, ["start_of_chorus", "soc"], false, null, null, null, null,
      // Directive No Match Function
      this.extra_chars_func),
    new DirectiveDefinition(["start_of_tab", "sot"], false, null, true, false, false, null, null, null, null,
      // Directive No Match Function
      this.extra_chars_func),
    new DirectiveDefinition(["end_of_tab", "eot"], false, null, false, ["start_of_tab", "sot"], false, null, null, null, null,
      // Directive No Match Function
      this.extra_chars_func),
    new DirectiveDefinition(["define", ], /([A-G]\w?}) ([Xx0-9]{6})/, null, true, false, true, null,
      // Value No Match Function
      function(input: Directive, definition: DirectiveDefinition, output: ChordProValidatorOutput): boolean {
        // Make sure code parameter is 6 characters long and only contains valid characters
        if((<RegExp>definition.value).test(input.value) == false) output.warnings.push("Warning: “code” parameter for “define” directive is not exactly 6 characters long or contains characters other than x, X, 0-9. Chord definition is ignored.");

        // Not strictly checking, making a dead assumption that if the code parameter failed, then the name parameter was shot.
        else output.warnings.push("Warning: “name” parameter for “define” directive does not start with uppercase letters A-G or contains spaces. Chord definition is ignored.");

        // Suppress error.
        return true;
      })
  ];

  constructor() { }

  /** Validates the input chordpro data and returns a list of errors and warnings.
   *
   * @param input
   * @returns {ChordProValidatorOutput}
   */
  validate(input: string): ChordProValidatorOutput {
    // Result arrays
    let output: ChordProValidatorOutput = new ChordProValidatorOutput();

    // Input data
    let lines: string[] = input.split(/\r?\n/).map(line => line.trim());

    // Controls
    let parseStack: any[] = [];

    for(let line of lines) {
      // Ignore comments and blank lines
      if (line.length <= 0 || line[0] == '#') continue;

      // Get directive
      let candidate: Directive;
      try {
        candidate = Directive.extractDirective(line);
      } catch (err) {  // Catch any parse errors and move to next line
        output.errors.push(err.message);
        continue;
      }

      // If no directive, continue to next line
      if (candidate) {

        // Find directive in use
        let directiveDef = null;
        for (let directiveDefLoop of this.acceptableDirectives) {
          if (directiveDefLoop.directiveMatch(candidate, output)) {
            directiveDef = directiveDefLoop;
            break;
          }
        }

        // If no match found, warn and continue.
        if (!directiveDef) {
          output.warnings.push("Warning: Found directive other than one of the supported directives (ignore). Directive: " + candidate.contents);
          continue;
        }

        // Check that value is valid
        if (!directiveDef.valueMatch(candidate, output, true)) continue;

        // Execute stack pops if requested, there is still stack left, and the looked-for directive has not been found yet.
        while (directiveDef.pop && parseStack.length > 1 && directiveDef.pop.indexOf(parseStack[parseStack.length - 1].directive) == -1) {
          console.log(parseStack.map(directive => directive.contents));
          parseStack.pop();
        }

        // Last one should be popped off; either is the match, or is the last one of the stack
        // and was going to get cleared regardless.
        if (parseStack.length && directiveDef.pop && directiveDef.pop.indexOf(parseStack[parseStack.length - 1].directive) == -1) {
          output.errors.push("Error: Parsing stack in invalid state, could not find pop target. Parsing " + candidate.contents + " Aborting.");
          break;
        }
        if (directiveDef.pop && parseStack.length) parseStack.pop();

        // Execute stack pushes if requested
        if (directiveDef.push === true) parseStack.push(candidate);

        // Execute stack functions if requested
        if (!isNullOrUndefined(directiveDef.stackFunc)) {
          try {
            directiveDef.stackFunc(parseStack, output)
          } catch (err) {
            // Error occurred.
            console.log(err);
          }
        }
        // Finished with directive, go to next line.
      }

      // If lyrics
      else {
        // Look for title in stack
        let title_found = false;
        for(let directive of parseStack) {
          if(["title",  "t"].indexOf(directive.directive) != -1) {
            // title found
            title_found = true;
            break;
          }
        }

        // Throw error if no title
        if(!title_found) {
          output.errors.push("Error: Missing “title” directive before start of lyrics.");
        }
        // Finished with lyric line, go to next line
      }
    }

    // Return results
    return output;
  }

}
