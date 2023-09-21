import { CommonModule } from '@angular/common';
import { Component, OnInit, HostListener } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { FirebaseService } from '../firebase.service';
import { observable } from 'rxjs';
import firebase from 'firebase/compat/app';
import { Router } from '@angular/router';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { BarcodeScanner } from '@awesome-cordova-plugins/barcode-scanner/ngx';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, ReactiveFormsModule, CommonModule],
  providers: [SweetAlert2Module, BarcodeScanner]
})
export class HomePage {
  nombre?: string = "";
  public creditos?: any = 0;

  constructor(private aut: FirebaseService, private router: Router, private barcodeScanner: BarcodeScanner, private toastCtrl: ToastController) {
  }

  async toastNotificationExito(mensaje: any) {
    let toast = this.toastCtrl.create({
      message: mensaje,
      duration: 3000,
      position: 'top',
      icon: 'alert-outline',
      color: 'success'
    });
    (await toast).present();
  }
  async toastNotificationDanger(mensaje: any) {
    let toast = this.toastCtrl.create({
      message: mensaje,
      duration: 3000,
      position: 'top',
      icon: 'alert-outline',
      color: 'danger'
    });
    (await toast).present();
  }

  async ngOnInit() {
    firebase.auth().onAuthStateChanged(user => {
      this.aut.creditos$.subscribe(creditos => {
        this.creditos = creditos;
        this.creditosIniciales();
      });
    });

  }

  async ionViewDidEnter() {

    this.nombre = this.getEmailPrefix(this.aut.email);
    this.creditosIniciales();
    this.aut.dismissLoading();
  }

  async limpiar() {
    this.aut.vaciarCreditos(this.aut.email);
    let creditosTotales = await this.aut.sumarCreditos(this.aut.email)
    this.aut.setCreditos(creditosTotales);
    this.aut.showLoading("");
    this.toastNotificationExito("Saldo vaciado");
  }
  async scan() {
    try {
      const barcodeData = await this.barcodeScanner.scan();
      console.log('Barcode data', barcodeData);
      let cantidadUsos;

      switch (await barcodeData.text) {
        case '8c95def646b6127282ed50454b73240300dccabc':
          cantidadUsos = await this.aut.contarCreditos(this.aut.email, 10);

          if ((cantidadUsos < 2 && this.aut.email === "admin@gmail.com") || cantidadUsos < 1) {
            this.aut.subirCredito(10, this.aut.email).then(() => {
              this.creditosIniciales();
              this.toastNotificationExito("Se agregaron 10 créditos");
            });
          } else {
            this.toastNotificationExito("Se ha alcanzado el límite de usos permitidos");
          }

          break;
        case 'ae338e4e0cbb4e4bcffaf9ce5b409feb8edd5172 ':
          cantidadUsos = await this.aut.contarCreditos(this.aut.email, 50);
          if ((cantidadUsos < 2 && this.aut.email === "admin@gmail.com") || cantidadUsos < 1) {
            this.aut.subirCredito(50, this.aut.email).then(() => {
              this.toastNotificationExito("Se agregaron 50 créditos");
              this.creditosIniciales();
            });
          } else {
            this.toastNotificationExito("Se ha alcanzado el límite de usos permitidos");
          }

          break;
        case '2786f4877b9091dcad7f35751bfcf5d5ea712b2f':
          cantidadUsos = await this.aut.contarCreditos(this.aut.email, 100);
          if ((cantidadUsos < 2 && this.aut.email === "admin@gmail.com") || cantidadUsos < 1) {
            this.aut.subirCredito(100, this.aut.email).then(() => {
              this.toastNotificationExito("Se agregaron 100 créditos");
              this.creditosIniciales();
            });
          } else {
            this.toastNotificationExito("Se ha alcanzado el límite de usos permitidos");
          }

          break;
        default:
          this.toastNotificationDanger("Código no válido");
          break;
      }

    } catch (err) {
      console.log('Error', err);

    } finally {
      await this.aut.dismissLoading(); // Hide loading after scanning
    }
  }



  getEmailPrefix(email: string): string {
    const parts = email.split("@");
    return parts[0];
  }

  logout() {
    firebase.auth().signOut().then(() => {
      this.aut.showLoading('Ingresando').then(() => this.router.navigateByUrl('log', { replaceUrl: true }));
      ;
    });
  }

  async creditosIniciales() {

    this.creditos = await this.aut.sumarCreditos(this.aut.email);
    console.log(this.creditos);
  }

}


