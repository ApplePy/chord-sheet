/**
 * Created by Darryl on 2016-11-26.
 */

export class ChordProValidatorOutput {

  constructor(public errors: string[] = [], public warnings: string[] = []) { }

  /** Convenience function to check if the validation did not complete without any warnings/errors.
   *
   * @returns {boolean}
   */
  containsIssues(): boolean {
    return (this.errors.length > 0 || this.warnings.length > 0);
  }

  /** Convenience function to check if validation had a critical error.
   *
   * @returns {boolean}
   */
  containsErrors(): boolean {
    return (this.errors.length > 0);
  }
}
