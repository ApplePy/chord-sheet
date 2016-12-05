import {Component, OnInit, ViewChild} from '@angular/core';
import {ErrorMessageComponent} from "../../common/error-message/error-message.component";
import {DmcaService} from "../../../services/dmca/dmca.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ModalComponent} from "../../common/modal/modal.component";

@Component({
  selector: 'app-dmca-dispute',
  templateUrl: 'dmca-dispute.component.html',
  styleUrls: ['dmca-dispute.component.css']
})
export class DmcaDisputeComponent implements OnInit {

  // HTML page binds
  @ViewChild("error") error: ErrorMessageComponent;
  @ViewChild('modal') modal: ModalComponent;

  // Contains dispute text
  dispute: string = "";
  invalid: boolean = false;

  // The DMCA request ID
  id: string;

  constructor(private dmca: DmcaService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    // Get ID from route
    this.route.params.subscribe(
      (result: any)=>{
        this.id = result.id;

        // Make sure this DMCA request exists
        this.dmca.getOneDmca(this.id).subscribe(
          result => {
          // Nothing for now.
        }, err => this.router.navigate(['/404']));

      },
      err=>{console.log(err); this.router.navigate(['/']);}
      );
  }

  submit($event: Event) {
    $event.preventDefault();

    // Stop a race condition where the subscription hasn't returned yet.
    if (!this.id) return;

    // Check for empty text
    if (this.dispute.length == 0) {
      this.invalid = true;
      this.error.title = "No Text";
      this.error.messages = ["The dispute text field is empty."];
      return;
    }

    // Send dispute, redirect to home if successful, display error otherwise.
    this.dmca.fileDispute(this.id, this.dispute).subscribe(
      result => {
        this.modal.title    = 'Form Successful';
        this.modal.message  = 'Message submitted';
        this.modal.negative = 'Close';
        this.modal.positive = 'Ok';
        this.modal.show();
        this.modal.response.subscribe(()=>setTimeout(()=>this.router.navigate(['/']), 1000));
      },
      err => {
        this.invalid = true;
        this.error.title = "Invalid Dispute";
        this.error.messages = (err && err.reason) ? [err.reason] : [err];
      }
    );
  }

}
