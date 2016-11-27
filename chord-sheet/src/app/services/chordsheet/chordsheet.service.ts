import { Injectable } from '@angular/core';
import {Http, Headers, Response} from'@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class ChordsheetService {

  constructor(private http: Http) { }

  retrieveChordSheets(latestOnly: boolean = false) {
    // Set postProcessMode
    let postProcess = (latestOnly) ? ChordsheetService.postProcessRevisionsLatest : ChordsheetService.postProcessRevisions;

    // Let other end know its JSON
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    // Send request, and store result as logged-in variable.
    return this.http.get("/api/chordsheets", {headers: headers})
      .map(res => postProcess(res.json()));
  }

  private static findMatchingMeta(revision: any, allMeta: any) {
    // Find metadata entry
    let metaEntry: any;
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

  private static postProcessRevisionsLatest(data: any) {
    // Iterate through results, fixing revision numbers
    let results: any[] = [];

    for (let revision of data.results) {

      // Find metadata entry
      let metaEntry = ChordsheetService.findMatchingMeta(revision, data.metadata);

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

  private static postProcessRevisions (data: any) {    // TODO: Convert to model to avoid 'any'
    let sortByRevision = (a: any, b: any) => b.revision - a.revision;   // TODO: Convert to model to avoid 'any'

    // Sort in order
    data.results.sort(sortByRevision);

    // Iterate through results, fixing revision numbers
    for (let revision of data.results) {

      // Find metadata entry
      let metaEntry = ChordsheetService.findMatchingMeta(revision, data.metadata);

      // Set revision number to remaining number of unfixed revisions, then decrement
      revision.revision = metaEntry.revisionCount--;
    }

    return data.results;
  }

  uploadChordSheet(songtitle: string, not_public: boolean, contents: string) {
    let data = JSON.stringify({songtitle: songtitle, "private": not_public, contents: contents});

    // Let other end know its JSON
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    // Send request
    return this.http.post("/api/chordsheets", data, {headers: headers})
      .map(res => res.json());
  }
}
