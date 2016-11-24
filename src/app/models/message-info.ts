/**
 * Created by darryl on 2016-11-23.
 */


// Class to represent warning modals
export class MessageInfo {
  protected active: boolean = false;
  protected title: string = "";
  protected details: string[] = [];

  //-------- CONSTRUCTORS --------//
  constructor() {
  }

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
  public setMessages(title: string, details: string[]) {
    this.active = true;
    this.title = title;
    this.details = details;
  }

  // Deactivate message
  public deactivate() {
    this.active = false;
  }
}
