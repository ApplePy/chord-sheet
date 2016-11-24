import { Injectable } from '@angular/core';

@Injectable()
export class ChordproValidatorService {
// TODO: Document all of this


  constructor() { }

  extractDirective(input: string): Object {
    // Get start and end of directive
    let start = input.indexOf('{');
    let end = input.indexOf('}');

    if (start === 0 && end === input.length - 1) {  // Valid directive brackets found
      // Get separator and value
      let val: string = null;
      let separator = input.indexOf(':');   // TODO: replace with .split()?
      if (separator === -1) {
        separator = end - 1;
      }
      else {
        // Get value
        val = input.substr(separator + 1, end - 1 - separator).trim();
      }

      // Create parsed object and return
      return {
        'contents': input.substr(start, end - start + 1).trim(),
        'directive': input.substr(start + 1, separator - start + 1).trim(),
        'value': val
      };
    }
    else if (start === -1 && end === -1) {          // No directive found
      return null;
    }
    else {                                        // Malformed directive brackets

      // If bracket missing
      if(start === -1 || end === -1) {
        throw "Error: Missing bracket.";
      }
      // If start in wrong place
      else if (start !== 0) {
        throw "Error: Starting curly brace anywhere other than at the start of the line.";
      }
      // If end is in wrong place
      else if (end !== input.length - 1) {
        throw "Error: Ending curly brace anywhere other than at the end of the line (after removing whitespace).";
      }
      else {
        throw "Error: Undefined error.";
      }
    }
  }

  // TODO: Create concrete return type
  validate(input: string): any {
    // Result arrays
    let errors: string[] = [];
    let warnings: string[] = [];
    let errorsAndWarnings: any = {errors: [], warnings: []};

    // Input data
    let lines: string[] = input.split(/\r?\n/);

    // Controls
    let acceptableDirectives: any =
      [
        {'directives': ["new_song","ns"], 'value': false, 'push': true, 'pop': ["new_song", "ns"]},
        {'directives': ["title",  "t"], 'value': /.*/, 'push': true, 'pop': false, 'stackFunc':function(stack: any[]) {
          for(let item of stack){
            if(["title",  "t"].indexOf(item.directive) != -1) {
              errors.push("Error: More than one “title” directive within the same “new_song” block.");
              return true;
            }
          }
          return false;}},
        {'directives': ["subtitle", "st"], 'value': /.*/, 'push': false, 'pop': false},
        {'directives': ["comment", "c"], 'value': /.*/, 'push': false, 'pop': false},
        {'directives': ["start_of_chorus", "soc"], 'value': false, 'push': true, 'pop': false},
        {'directives': ["end_of_chorus", "eoc"], 'value': false, 'push': false, 'pop': ["start_of_chorus", "soc"]},
        {'directives': ["start_of_tab", "sot"], 'value': false, 'push': true, 'pop': false},
        {'directives': ["end_of_tab", "eot"], 'value': false, 'push': false, 'pop': ["end_of_tab", "eot"]},
        {'directives': ["define", ], 'value': /([A-G]\w{0,1}) ([Xx0-9]{6})/, 'push': true, 'pop': false, 'warning': true,
          'errFunc': function(input: string) {
            if(/([A-G]\w{0,1})/.test(input) == false) {
              warnings.push("Warning: “name” parameter for “define” directive does not start with uppercase letters A-G or contains spaces. Chord definition is ignored.");
            }
            // Not strictly checking, making a dead assumption
            else {
              warnings.push("Warning: “code” parameter for “define” directive is not exactly 6 characters long or contains characters other than x, X, 0-9. Chord definition is ignored.");
            }
          }}
      ];
    let parseStack: any[] = [];

    let lineNum: number = 0;

    // Error: Missing “title” directive before start of lyrics.
    //   Error: More than one “title” directive within the same “new_song” block.
    //   Error: Missing separator (“:”) or text for “title”, “subtitle”, “comment” or “define” directives.
    //   Error: Extra characters for “soc”, “eoc”, “sot” or “eot” directives.
    //   Warning: “name” parameter for “define” directive does not start with uppercase letters A-G or contains spaces. Chord definition is ignored.
    //   Warning: “code” parameter for “define” directive is not exactly 6 characters long or contains characters other than x, X, 0-9. Chord definition is ignored.

    line:
      for(let line of lines) {
        // Ignore comments and blank lines
        if(line.length <= 0 || line[0] == '#') {
          continue;
        }

        // Get directive
        let result: any ;
        try {
          result = this.extractDirective(line);
        } catch(err) {  // Catch any parse errors and move to next line
          errors.push(err);
          continue;
        }

        // If directive, parse
        if(result !== null) {
          // Find directive in use
          for (let directive of acceptableDirectives) {

            // Find specific directive permutation
            for (let perm of directive.directives) {

              // If directive is found
              if (result.directive.indexOf(perm) !== -1) {

                // Check if directive has extra characters
                if (perm.length != result.directive.length) {
                  errors.push("Error: Extra characters for “soc”, “eoc”, “sot” or “eot” directives.");
                  continue line; // Leave the nested for loops
                }

                break;  // Leave permutation checking

              }

            }

            // Check that value is valid
            console.log(result);
            console.log(directive);
            // Value is null but required value isn't
            if(result.value == null && directive.value != false) {   // NOTE: == is intentional, as it will match empty text or null
              errors.push("Error: Missing separator (“:”) or text for “title”, “subtitle”, “comment” or “define” directives.");
            }
            // Value isn't null but required value is
            else if (result.value != null && directive.value == false) {
              errors.push("Error: An undefined value error!");
            }
            // Value and required are both false
            else if (result.value == null && directive.value == false) {
              // Skip over
            }
            // Value and required are both available
            else if (directive.value.test(result) == false) {
              if(directive.warning == true) {
                directive.errFunc(result.value);
              } else {
                errors.push("Error: Undefined value error!");
              }
            }

            // Value and directives are valid, execute stack commands
            if (directive.pop != [] && parseStack.length > 0) {   // NOTE: != is intentional, looking for false, empty lists, etc.
              // While the top of the stack does not contain the directive
              while (directive.directives.indexOf(parseStack[parseStack.length - 1].directive) !== -1) {
                // TODO: Handle if we emptied out the whole stack better!
                parseStack.pop();
                if (parseStack.length <= 0) break;
              }
              parseStack.pop(); // clear off the one to be popped, or last of the stack
            }

            if (directive.push === true) {
              parseStack.push(result);
            }

            // Run custom functions
            if (directive.stackFunc != undefined) {
              console.log(directive);
              if (directive.stackFunc(parseStack) == true) {
                // Error occurred, although nothing to do so far.
              }
            }

            continue line;  // Finished with directive, go to next line TODO: deal with display
          }

          warnings.push("Warning: Any directive other than one of the supported directives (ignore)");
        }

        // If lyrics
        else {
          // Look for title in stack
          let title_found = false;
          for(let directive of parseStack) {
            if(["title",  "t"].indexOf(directive.directive) != -1) {
              // title found
              title_found = true;
            }
          }

          // Throw error if no title
          if(!title_found) {
            errors.push("Error: Missing “title” directive before start of lyrics.");
          }

          // TODO: Render for display

          continue line;  // Finished with lyric line, go to next line
        }

      }

    // Compile results
    errorsAndWarnings.errors = errors;
    errorsAndWarnings.warnings = warnings;

    // Return results
    return errorsAndWarnings;
  }

}
