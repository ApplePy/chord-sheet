// Gives the type definition for the backend.

/**
 * Declares the range of responses that come from the backend.
 */
declare namespace APIResponse {

  /**
   * Declares the elements of the JSON results object returned from the API backend.
   */
  interface Results {
    success: boolean,
    reason?: string
  }

  interface Login extends Results {
    "username": string,
    "firstname": string,
    "lastname": string
  }

  /**
   * Declares the elements of the JSON object returned from the Chordsheets backend.
   */
  interface Chordsheet {
    metadata: ChordsheetElements.metadata[],
    results: ChordsheetElements.result[]
  }
  namespace ChordsheetElements{
    interface metadata {
      _id: {owner: string, songtitle: string},
      latestRevision: number,
      revisionCount: number
    }
    interface result {
      _id: string,
      revision: number,
      contents: string,
      owner: string,
      private: boolean,
      songtitle: string,
      date: string
    }
  }
}
