import {Directive} from "./directive";
import {ChordProValidatorOutput} from "./chordpro-validator-output";
import {isNullOrUndefined} from "util";
/**
 * Created by Darryl on 2016-11-26.
 */

/**
 * This interface specifies how the custom stack operation function works when defined.
 */
export interface StackFuncInterfaceIn {
  /** The stack function interface.
   *
   * @param parseStack      The stack to be operated against.
   * @param definition      The calling DirectiveDefinition.
   * @param validatorOutput The object into which to output error and warning messages.
   * @returns {void}
   */
  (parseStack: Directive[], definition: DirectiveDefinition, validatorOutput: ChordProValidatorOutput);
}

/**
 * This interface specifies how the custom stack operation function works when called.
 */
export interface StackFuncInterface {
  /** The stack function interface.
   *
   * @param parseStack      The stack to be operated against.
   * @param validatorOutput The object into which to output error and warning messages.
   * @returns {void}
   */
  (parseStack: Directive[], validatorOutput: ChordProValidatorOutput);
}

/**
 * This interface specifies a custom function with which to respond to a failed value match.
 */
export interface MatchingInterface {
  /** The error function interface.
   *
   * @param input           The input that validation was done against.
   * @param definition      The definition that validation was done against.
   * @param validatorOutput (Optional) The object into which to output error and warning messages.
   * @returns {boolean}     true to change match to true, false to change match to false.
   */
  (input: Directive, definition: DirectiveDefinition, validatorOutput?: ChordProValidatorOutput): boolean;
}

export class DirectiveDefinition {
  stackFunc: StackFuncInterface = null;

  /** Specifies the creation of a DirectiveDefinition object.
   *
   * @param directives  A list of strings that specify what directives match this definition.
   * @param value       A RegExp that needs to be matched for the directive's value to be valid, false if there is not supposed to be a value.
   * @param msg         Error message if the value matching fails. Allowed to be null.
   * @param push        Specifies if the directive should be pushed to the parse stack.
   * @param pop         A list of strings that specify what directives the pop should be unwound to when found. False if popping should not occur.
   * @param warning     Specifies if a failed value should be considered an error(false, default) or a warning (true).
   * @param _stackFunc  (Optional) A function that is called after initial processing. Adheres to StackFuncInterface.
   * @param errFunc     (Optional) A function that is called if value validation fails.
   * @param succFunc    (Optional) A function that is called if value validation succeeds.
   * @param matchFunc   (Optional) A function that is called if directive validation succeeds.
   * @param noMatchFunc (Optional) A function that is called if directive validation fails.
   */
  constructor(
    public readonly directives: string[],
    public readonly value: boolean | RegExp,
    public readonly msg: string | null,
    public readonly push: boolean,
    public readonly pop: boolean | string[],
    public readonly warning: boolean = false,
    private readonly _stackFunc?: StackFuncInterfaceIn,
    public readonly errFunc?: MatchingInterface,
    public readonly succFunc?: MatchingInterface,
    public readonly matchFunc?: MatchingInterface,
    public readonly noMatchFunc?: MatchingInterface
  ) {
    // Default error message
    if (!msg) this.msg = "Error: Undefined error!";

    // Pre-apply Definition.
    if (_stackFunc) {
      this.stackFunc = function (parseStack: Directive[], validatorOutput: ChordProValidatorOutput) {
         _stackFunc(parseStack, this, validatorOutput)
      }
    }
  }

  /** Checks a supplied directive to see if it matches the definition.
   *
   * @param candidate       The directive to check.
   * @param validatorOutput The output for warnings and errors.
   * @returns {boolean}     true if match, false otherwise.
   */
  directiveMatch(candidate: Directive, validatorOutput: ChordProValidatorOutput): boolean {
    // Find specific directive permutation
    for (let perm of this.directives) {
      // If directive is found (verify substring AND length)
      if (candidate.directive.indexOf(perm) == 0 && candidate.directive.length == perm.length) {
        // Run matchFunc if supplied
        if (this.matchFunc) return this.matchFunc(candidate, this, validatorOutput);
        else return true;
      }
    }

    // Match not found
    if (this.noMatchFunc) return this.noMatchFunc(candidate, this, validatorOutput);
    else return false;
  }

  /** Checks a supplied directive to see if it's value matches the definition.
   *
   * @param candidate     The directive to check.
   * @param output        The output for warnings and errors.
   * @param disableCheck  true to disable checking if candidate is correct directive type, false (default) otherwise.
   * @returns {boolean}   true if match, false otherwise.
   */
  valueMatch(candidate: Directive, output: ChordProValidatorOutput, disableCheck: boolean = false): boolean {
    if (!disableCheck && !this.directiveMatch(candidate, output)) throw new Error("Error: This candidate is not an instance of this directive definition.");

    // Calling procedures
    let errCalling = () => {
      if (this.errFunc) return this.errFunc(candidate, this, output);
      else if (this.warning) output.warnings.push(this.msg);
      else output.errors.push(this.msg);
      return false;

    };

    let succCalling = () => {
      if (this.succFunc) return this.succFunc(candidate, this, output);
      else return true;
    };


    // Value checking

    // Value is null but required value isn't
    if(isNullOrUndefined(candidate.value) && this.value !== false) return errCalling();

    // Value isn't null but required value is
    else if (!isNullOrUndefined(candidate.value) && this.value === false) return errCalling();

    // Value and required are both false
    else if (isNullOrUndefined(candidate.value) && this.value === false) return succCalling();

    // Value and required are both available
    else {
      // If the value doesn't match the regex
      if ((<RegExp>this.value).test(candidate.value) === false)  errCalling();
      else return succCalling();
    }
  }
}
