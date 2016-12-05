import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DmcaService } from "../../../services/dmca/dmca.service";
import { ModalComponent } from "../../common/modal/modal.component";

@Component({
  selector: 'app-dmca-request-form',
  templateUrl: 'dmca-request-form.component.html',
  styleUrls: ['dmca-request-form.component.css']
})
export class DmcaRequestFormComponent implements OnInit {

  @ViewChild('modal') modal: ModalComponent;

  form: FormGroup;

  constructor(fb: FormBuilder, private dmca: DmcaService, private router: Router){

    this.form = fb.group({
      'claimant' : [null, Validators.required],
      'originalWork': [null, Validators.required],
      'contactInfo' : [null, Validators.compose([Validators.required, Validators.pattern(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/)])],
      'iSongTitle' : [null, Validators.required],
      'iOwner' : [null, Validators.required],
      'faith' : [false, Validators.pattern('true')],
      'accurate': [false, Validators.pattern('true')]
    })
  }

  ngOnInit() {
  }

  submitForm(form: any):void{
    this.dmca.fileRequest(form).subscribe(
      result => {
        this.modal.title    = 'Form Successful';
        this.modal.message  = 'Message submitted';
        this.modal.negative = 'Close';
        this.modal.positive = 'Ok';
        this.modal.show();
        this.modal.response.subscribe(()=>setTimeout(()=>this.router.navigate(['/']), 1000));
      }, err => {
        this.modal.title    = 'Form Failed';
        this.modal.message  = (err && err.reason) ? err.reason: err;
        this.modal.negative = 'Exit';
        this.modal.positive = 'Try Again';
        this.modal.show();
        this.modal.response.subscribe(result=>{
          if (!result)
            setTimeout(()=>this.router.navigate(['/']), 1000);
        });
      }
    );
  }
}
