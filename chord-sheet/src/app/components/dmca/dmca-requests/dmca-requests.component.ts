import {Component, OnInit, ViewChild} from '@angular/core';
import {DmcaService} from "../../../services/dmca/dmca.service";
import DMCA = APIResponse.DMCA;
import {ModalComponent} from "../../common/modal/modal.component";

@Component({
  selector: 'app-dmca-requests',
  templateUrl: 'dmca-requests.component.html',
  styleUrls: ['dmca-requests.component.css']
})
export class DmcaRequestsComponent implements OnInit {
  @ViewChild("modal") modal: ModalComponent;

  dmcaRequests: DMCA[] = [];

  constructor(private dmca: DmcaService) { }

  ngOnInit() {
    // Get DMCA requests
    this.dmca.getDmca().subscribe(
      results => {
        this.dmcaRequests = results;
      }, err => console.log(err)
    );
  }

  disableDmca(req: DMCA) {
    this.dmca.disableDmca(req).subscribe(
      ()=>{
        req.active = !req.active;
      },
      err => console.error(err)
    );
  }

  displayNotice(request: DMCA) {

    // Email template
    let emailText = (req: DMCA): string => {
      return `Dear ${req.iOwner},\n\n` +
        `We have been informed that your content '${req.iSongTitle}' is infringing on the copyrighted work ` +
          `'${req.originalWork}', owned by ${req.claimant}. Please note that as per the DMCA, we have disabled access ` +
          `to this content. If you wish to file a dispute, you may do so at https://chordsheet.com/dmca/dispute/${req._id}. \n\n` +
          `Sincerely, \n\n\n` +
          `ChordSheet.com`
    };

    this.modal.title    = "Notice Text for " + request.iOwner;
    this.modal.message  = emailText(request);
    this.modal.negative = "Cancel";
    this.modal.positive = "Ok";

    this.modal.show();
  }

}
