import { Component } from '@angular/core';
import { ConfigService } from './services/config.service';
import { checkNewVersion } from './../utils';
let semver = require('semver');
let notifier = require('node-notifier');
const { app } = require('electron').remote;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})

export class AppComponent {
  constructor(private config: ConfigService) {
    // checkNewVersion(config.getUpdateServer()).then(lastVersion => {
    //   if (semver.gt(lastVersion, app.getVersion())) {
    //     notifier.notify({
    //       title: `New version is available!`,
    //       message: `bterm version ${lastVersion} is available.`
    //     });
    //   }
    // }).catch(err => {
    //   notifier.notify({
    //     title: 'Error',
    //     message: JSON.stringify(err)
    //   });
    // });
  }
}
