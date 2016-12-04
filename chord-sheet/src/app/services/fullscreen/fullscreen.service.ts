import { Injectable } from '@angular/core';
import { Observable, Subscriber } from "rxjs";

@Injectable()
export class FullscreenService {

  constructor() { }

  private observable: Observable<boolean>;
  private observers: Subscriber<boolean>[] = [];

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

      // Add observer to list of observers
      if (this.observers.indexOf(observer) === -1)
        this.observers.push(observer);

      // Iterates through the observers, calling all of their next functions
      this.trigger = (status: boolean) => {
        for (let obr of this.observers)
          obr.next(status);
      };

      // Adds a lambda to be executed when the Observer un-subscribes from your Observable
      observer.add(Subscriber.create((test: boolean)=>this.observers.slice(this.observers.indexOf(observer), 1)));

    });

    return this.observable;
  }

}
