import { Component, OnInit, Input } from '@angular/core';

import { Router } from '@angular/router-deprecated';

import { Http, Response } from '@angular/http';
import {Headers, RequestOptions} from '@angular/http';
import 'rxjs/Rx';

import { NounComponent } from './noun.component';
import { NounService } from './services/noun.service';

import { VerbService } from './services/verb.service';

import { CollectionComponent } from './collection.component';
import { DetailComponent } from './detail.component';

import { MOCKMODULES } from './util/mock-modules';

@Component({
  selector: 'my-dashboard',
  templateUrl: 'app/html/dashboard.component.html',
  styleUrls: ['app/css/dashboard.component.css'],
  directives: [NounComponent, CollectionComponent, DetailComponent]
})
export class DashboardComponent implements OnInit {

  expanded: boolean = false;

  subscription: any;

  psSubscription: any;

  verbs: any;

  selectedNoun: any;

  startup: boolean = true;

  verbHighlighted: any;

  currCommand: string;

  constructor(
    private router: Router,
    private http: Http,
    private nounService: NounService,
    private verbService: VerbService
  ) { }

  ngOnInit() {
    this.verbs = null;

    this.subscription = this.nounService.nounSelected$.subscribe(noun => this.getVerbs(noun));

    this.psSubscription = this.verbService.previewCommand$.subscribe(command =>  {
      this.verbService.updateConsole(command);
    });

    document.getElementById('ps-command').addEventListener("click", this.onClick, false);
    document.getElementById('ps-command').addEventListener("keypress", this.onKeypress, false);

    this.toggleConsole();

    this.currCommand = '';

  }

  onClick() {
    console.log("Clicked");
    document.getElementById('ps-command').contentEditable = "true";
    document.getElementById('ps-command').focus();
    this.currCommand = '';
  }

  onKeypress(event) {
    console.log("Keypress");
    var keyCode = event.keyCode;

    console.log(event);

    //Keycode for enter
    if (keyCode === 13) {
      var old = document.getElementById('ps-command').innerHTML;
      var psconsole = document.getElementById('ps-command');
      document.getElementById('ps-command').innerHTML = old + '<br> <img class="ps-icon" src="./app/img/psicon.png" style="height: 35px; width: 35px;"/> <br>';

      console.log("Curr Command: " + this.currCommand);

      //TODO: Move this to a service
      this.http.get('/run?' + "command=" + this.currCommand)
         .subscribe(
              res => {
                console.log(res.json());
                //document.getElementById("output").innerHTML = res.json();

                var newHtml = "";
                var results = res.json();
                for (var i = 0; i < results.length; i++) {
                  newHtml += '<div style="font-size: 1.3em;">' + results[i] + '</div>';
                }

                document.getElementById("output").innerHTML = newHtml;

                this.nounService.setSelected(this.nounService.selected);

              },
              error => { console.log(error); }
      );

      this.currCommand = '';
    }
    else {
      if (event.key) {
          this.currCommand += event.key;
      }
    }

    console.log(this.currCommand);
  }

  getVerbs(noun) {

    this.startup = false;

    this.selectedNoun = noun.name;

    this.verbs = null;

    //TODO: Move this to a service
    this.http.get('/verbs?' + "noun=" + noun.name)
       .subscribe(
            res => {  console.log(res.json());  this.verbs = res.json(); },
            error => { console.log(error); this.verbs = null; }
    );
  }

  toggleConsole() {
    if (this.expanded) {
      var dash = document.getElementById("dash").style.height = "96%";
      var psconsole = document.getElementById("ps-console").style.height = "4%";

      document.getElementById("ps-arrow").className = "glyphicon glyphicon-triangle-top";
      document.getElementById("ps-arrow").style.top = "97%";
      document.getElementById("ps-arrow").style.right = "20px";

      //A way to quickly scroll to the bottom
      document.getElementById("ps-console").scrollTop = document.getElementById("ps-console").scrollHeight;
    }
    else {
      var dash = document.getElementById("dash").style.height = "85%";
      var psconsole = document.getElementById("ps-console").style.height = "15%";

      document.getElementById("ps-arrow").className = "glyphicon glyphicon-triangle-bottom";
      document.getElementById("ps-arrow").style.top = "85%";
      document.getElementById("ps-arrow").style.right = "1px";
    }

    this.expanded = !this.expanded;
  }

  getCommand(verb) {
    document.getElementById("output").style.display = "none";
    document.getElementById("inputs").style.display = "none";

    var verbDom = document.getElementById("verb-" + this.verbHighlighted);

    if (this.verbHighlighted != null && verbDom !== null) {
        verbDom.style.backgroundColor = "transparent";
        verbDom.style.color = "#2098D1";
    }
    document.getElementById("verb-" + verb).style.backgroundColor = "#2098D1";
    document.getElementById("verb-" + verb).style.color = "white";

    this.verbHighlighted = verb;

    var command = verb + "-" + this.selectedNoun;

    //this.verbService.updateConsole(command);

    document.getElementById("information").innerHTML = '<div *ngIf="!details" style="margin-top: 30%; margin-left: 7%;" class="c-progress f-indeterminate-regional" role="progressbar" aria-valuetext="Loading..." tabindex="0">'
        + '<span></span>'
        + '<span></span>'
        + '<span></span>'
        + '<span></span>'
        + '<span></span>'
        + '</div>';

    this.verbService.currentCommand = command;

    //TODO: Move this to a service
    this.http.get('/command-details?' + "command=" + command)
       .subscribe(
            res => {
              console.log(res.json());
              this.verbService.setVerbDetails(res);
              document.getElementById("inputs").style.display = "block";
              document.getElementById("details").style.display = "block";
            },
            error => { console.log(error); }
    );
    
  }

  updateConsole(command) {
    var old = document.getElementById("ps-command").innerHTML;

    document.getElementById("ps-command").innerHTML = old + '<br> <img class="ps-icon" src="./app/img/psicon.png"/>' + "<span>" + command + "</span>";

    //A way to quickly scroll to the bottom
    document.getElementById("ps-console").scrollTop = document.getElementById("ps-console").scrollHeight;
  }


}
