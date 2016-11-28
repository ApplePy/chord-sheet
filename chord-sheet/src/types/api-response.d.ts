// Gives the type definition for the backend.

/**
 * Declares the range of responses that come from the backend.
 */
declare namespace APIResponse {

  /**
   * Declares the elements of the JSON object returned from the Login backend.
   */
  interface Login {
    success: boolean,
    reason?: string
  }
}
