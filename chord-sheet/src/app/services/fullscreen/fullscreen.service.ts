import { Injectable } from '@angular/core';
import { Observable } from "rxjs";

@Injectable()
export class FullscreenService {

  constructor() { }

  private observable: Observable<boolean>;

  trigger = (status: boolean)=>{};


  /** Notify listeners of change to/from fullscreen mode.
   *
   * @param fullscreen The new state
   */
  notify(fullscreen: boolean = false) {
    this.trigger(fullscreen);
  }


  /** Creates an observable that notifies on fullscreen mode change.
   *
   * @returns {Observable<boolean>}
   */
  getNotification(): Observable<boolean> {

    // If one already made, use that
    if (this.observable)
      return this.observable;

    this.observable = Observable.create(observer => {
      this.trigger = (status: boolean) => observer.next(status);
    });

    return this.observable;
  }

}
