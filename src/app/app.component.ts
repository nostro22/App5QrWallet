import { Component } from '@angular/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { IonicModule, Platform } from '@ionic/angular';
import firebase from 'firebase/compat/app';
import { environment } from 'src/environments/environment.prod';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonicModule]

})


export class AppComponent {
  constructor(private platform: Platform){}
  ngOnInit() {
    this.platform.ready().then(() => {
      
      SplashScreen.hide();
    });
    window.screen.orientation.lock('portrait');
    firebase.initializeApp(environment.firebaseConfig);
  }
}
