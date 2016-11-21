import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
declare var $: any;

@Component({
  selector: 'app-edit-screen',
  templateUrl: './edit-screen.component.html',
  styleUrls: ['./edit-screen.component.css']
})
export class EditScreenComponent implements OnInit {
  @ViewChild("uploadform") uploadform: ElementRef;  // Reference to the form

  _initial_title: string;                           // The title that the form initially started with
  placeholder: string = "Chord Sheet Name";         // Placeholder text for the title
  title: string;                                    // Title of the new sheet

  file_contents: string = "";                       // Contents of the uploaded sheet
  manual_input: string = "";                        // Contents of manual data entry

  // Errors and warnings
  error: MessageInfo = new MessageInfo();
  warning: MessageInfo = new MessageInfo();

  // Clear all error messages
  private clearMessages(){
    this.error.deactivate();
    this.warning.deactivate();
  }

  // Set up title if supplied
  ngOnInit(initial_title: string = "") {
    if (!initial_title) {
      this.title = initial_title;
      this._initial_title = initial_title;
    }
  }

  // When file is selected for upload
  fileUpload(event: Event) {

    // Get files
    let target = <any> event.target;
    let files = target.files;

    // If a file was deselected
    if (files.length === 0) {
      this.file_contents = "";  // Remove file contents
    }

    // File was selected
    else {
      // Get file
      let file = files[0];
      let reader = new FileReader();

      // Check file limits
      if(file.size >= Math.pow(1024, 2)) {
        this.file_contents = "";
        this.error.setMessage("File too big", "The supplied file is over 1MB.");
        target.value = "";
        return;
      }

      // Read file and set success and error handlers
      reader.readAsText(file, 'UTF-8');
      reader.onload = function (evt: any) {
          this.file_contents = evt.target.result;
          this.clearMessages();
        }.bind(this);

      reader.onerror = function(evt: any) {
        this.setMessages("Bad file", evt.toString());
      }.bind(this);
    }
  }

  // Trigger the page's actual reset
  triggerReset(){
    this.uploadform.nativeElement.reset();
    this.file_contents = '';
    this.clearMessages();
    this.title = this._initial_title;
  }

  // Ask to clear file contents when reset is triggered
  resetConfirm() {
    $('.ui.basic.modal').modal('show');
  }

  // Submit form
  submit(event: Event) {
    let validator = new ChordProValidator();
    let results = validator.validate(this.testString);

    if (results[0].length > 0) {
      this.error.setMessage("Parse Errors", "Multiple parsing errors occurred.");   // TODO: Fix!
      event.preventDefault();
    }
    if (results[1].length > 0) {
      this.warning.setMessage("Parse Errors", "Multiple parsing errors occurred.");   // TODO: Fix!
      event.preventDefault();
    }
    console.log(results);
    // TODO: Validate all data before sending
  }




  testString:string = "{t:Hallelujah}\n\
{st:Jeff Buckley}\n\
{c: Sheet Music by Leonord Cohen}\n\
\n\
#\n\
#This tab is for Hallelujah, as i've found i've not really gotten on with the other ones\n\
#here. The song is obviously picked but if you find that too difficult it also works\n\
#well strummed but picking the root notes of the chord with your thumb. With the G and E7\n\
#the start of each verse do a 2-3 up to the G and a 2-0 on the way down to the E7 on the\n\
#E string.\n\
{sot}\n\
\n\
{eot}\n\
[G]  [Em]  [G]  [Em]\n\
\n\
[G]I heard there was a s[Em]ecret chord\n\
That [G]David played and it [Em]pleased the Lord\n\
But [C]you don't really [D7] care for music, d[G]o ya?   [D7]\n\
W[G]ell it goes like this the [C]fourth, the [D7]fifth\n\
[Em]The minor fall and the [C]major lift\n\
The [D7]baffled king [B7]composing halle[Em]lujah\n\
\n\
{soc}\n\
Ha[C]llelujah, ha[Em]llelujah, ha[C]llelujah, ha[G]llelu[D7]-u-u-u-ja[G]aah     [Em]  [G]  [Em]\n\
{eoc}";

}

class ChordProValidator {

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

  validate(input: string): any[][] {
    // Result arrays
    let errors: string[] = [];
    let warnings: string[] = [];
    let errorsAndWarnings: string[][] = [];

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
    errorsAndWarnings.push(errors);
    errorsAndWarnings.push(warnings);

    // Return results
    return errorsAndWarnings;
  }
}

// Class to represent warning modals  TODO: See if modals can be refactored out into a component
class MessageInfo {
  protected active: boolean = false;
  protected title: string = "";
  protected details: string[] = [];

  //-------- CONSTRUCTORS --------//
  constructor() {}

  //-------- GETTERS --------//
  // Get active state
  public isActive(): boolean {
    return this.active;
  }

  // Get title
  public getTitle(): string {
    return this.title;
  }

  // Get details
  public getDetails(): string[] {
    return this.details;
  }

  //-------- SETTERS --------//
  // Set one error
  public setMessage(title: string, details: string) {
    this.setMessages(title, [details]);
  }

  // Set multiple errors
  public setMessages(title: string, details: string[]){
    this.active = true;
    this.title = title;
    this.details = details;
  }

  // Deactivate message
  public deactivate() {
    this.active = false;
  }
}
