import { Injectable } from '@angular/core';
import {Http, Headers} from'@angular/http';
import { Router, Resolve, ActivatedRouteSnapshot } from "@angular/router";
import {UserService} from "../user/user.service";
import 'rxjs/add/operator/map';
import {Observable} from "rxjs";
import ChordsheetPackage = APIResponse.ChordsheetPackage;
import Chordsheet = APIResponse.CsElements.Chordsheet;
import Metadata = APIResponse.CsElements.Metadata;
import Results = APIResponse.Results;


@Injectable()
export class ChordsheetService implements Resolve<Chordsheet>{


  // ---- METHODS ---- //

  constructor(private http: Http, private user: UserService, private router: Router) { }


  /** Pre-load data from songtitle before loading edit page.
   *
   * @param route   The route requested
   * @returns {Observable<Chordsheet>|Observable<{}>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<Chordsheet>|Observable<{}> {
    // Leave to back to sanitize.
    if (route.params) {
      let songtitle = route.params['songtitle'];
      let username = (route.params['username']) ? route.params['username'] : this.user.username;

      // Resolver was called on the proper routes
      if (songtitle)
        // Get chordsheet and return them, or catch the error and go to the main page
        return this.retrieveChordSheets(false, songtitle, username);  // On access to disallowed resource, it returns undefined.
    }

    // Why is the route attached to a bad url?
    return Observable.of(null);
  }


  /** Returns all the chordsheets available to the user.
   *
   * @param latestOnly          Retrieve only the latest revisions of each chordsheet.
   * @param songtitle           Only retrieve tracks with the given song title.
   * @param username            Only retrieve tracks with the following username. Songtitle must be specified when using this parameter.
   * @returns {Observable<Chordsheet[]>}
   */
  retrieveChordSheets(latestOnly: boolean = false, songtitle: string = "", username: string = ""): Observable<Chordsheet[]> {
    // Set postProcessMode
    let postProcess = (latestOnly) ? this.postProcessRevisionsLatest.bind(this) : this.postProcessRevisions.bind(this);

    // Configure URL appends
    let append = "";
    if (username) {
      if (songtitle) append = '/' + songtitle + '/' + username;
      else return Observable.throw(new Error("Songtitle missing with username."));
    }
    else if (songtitle) append = "/" + songtitle;

    // Let other end know its JSON
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    // Send request, and store result as logged-in variable.
    return this.http.get("/api/chordsheets" + append, {headers: headers})
      .map(res => postProcess(res.json()));
  }


  /** Finds the metadata entry corresponding to a doc revision.
   *
   * @param revision      The chordhsheet revision.
   * @param allMeta       All the metadata returned from the back.
   * @returns {Metadata}
   */
  private findMatchingMeta(revision: Chordsheet,
                                  allMeta: Metadata[]): Metadata {
    let metaEntry: Metadata;
    for (let entry of allMeta) {
      if (revision.owner == entry._id.owner && revision.songtitle == entry._id.songtitle) {
        // Found entry, save and stop search
        metaEntry = entry;
        break;
      }
    }

    // Sanity check
    if(!metaEntry) throw new Error("Metadata entry not found!");

    return metaEntry;
  }


  /** Get only the latest revision of each chordsheet.
   *
   * @param data  The JSON object returned from the backend.
   * @returns {Chordsheet[]}
   */
  private postProcessRevisionsLatest(data: ChordsheetPackage): Chordsheet[] {
    // Iterate through results, fixing revision numbers
    let results: Chordsheet[] = [];

    for (let revision of data.results) {

      // Find metadata entry
      let metaEntry = this.findMatchingMeta(revision, data.metadata);

      // If the revision number matches the latest revision, add to results
      if (revision.revision == metaEntry.latestRevision) {
        revision.revision = metaEntry.revisionCount;
        results.push(revision);
      }
    }

    // Replace old data with new data
    data.results = results;

    return data.results;
  }


  /** Get all revisions of each chordsheet, updating the revision number to its relative (e.g. 1,5,9 => 1,2,3).
   *
   * @param data  The JSON object returned from the backend.
   * @returns {Chordsheet[]}
   */
  private postProcessRevisions (data: ChordsheetPackage): Chordsheet[] {
    let sortByRevision = (a: Chordsheet,
                          b: Chordsheet): number => b.revision - a.revision;

    // Sort in order
    data.results.sort(sortByRevision);

    // Iterate through results, fixing revision numbers
    for (let revision of data.results) {

      // Find metadata entry
      let metaEntry = this.findMatchingMeta(revision, data.metadata);

      // Set revision number to remaining number of unfixed revisions, then decrement
      revision.revision = metaEntry.revisionCount--;
    }

    return data.results;
  }


  /** Upload a chordsheet to the backend.
   *
   * @param songtitle     The songtitle for the sheet.
   * @param not_public    Whether the new sheet should be private.
   * @param contents      The contents of the new sheet.
   * @param oldContents   For page updates, contains the old state of the page to help the back identify the edited song.
   * @returns {Observable<Results>}
   */
  uploadChordSheet(songtitle: string, not_public: boolean, contents: string, oldContents?: Chordsheet): Observable<Results> {
    let objData: any = {songtitle: songtitle, "private": not_public, contents: contents};

    // Add old data to objData if exists
    if (oldContents)
      objData.oldversion = oldContents;

    // Convert data for transport
    let data = JSON.stringify(objData);

    // Let other end know its JSON
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    // Send request
    return this.http.post("/api/chordsheets", data, {headers: headers})
      .map(res => res.json());
  }


  /** Deletes a chordsheet.
   *
   * @param songtitle           The songtitle to delete. (The backend will only delete songtitles belonging to you)
   * @returns {Observable<Results>}
   */
  deleteChordSheet(songtitle: string): Observable<Results> {
    let data = JSON.stringify({songtitle: songtitle});

    // Send request
    return this.http.delete("/api/chordsheets/" + songtitle)
      .map(res => res.json());
  }
}
