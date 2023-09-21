import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/storage'
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/storage'
import 'firebase/compat/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { LoadingController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  constructor(private router: Router,private toastCtrl: ToastController, private loadingCtrl: LoadingController) { }
  private user: any;
  public usuarioAutenticado: any;
  public email: any;

  async login(email: string, password: string, modal:boolean) {
    try {
      const validado = await firebase.auth().signInWithEmailAndPassword(email,password );
       this.showLoading('Ingresando');

      if (validado) {
        // Validation successful
        modal = false;
        this.usuarioAutenticado=firebase.auth().currentUser;
        this.email=firebase.auth().currentUser?.email;
        this.router.navigateByUrl('home', { replaceUrl: true });
      } else {
        // Validation failed
        this.toastNotification('Llene ambos campos correo electrónico y clave');
      }
    } catch (error: any) {
      switch (error.code) {
        case 'auth/user-not-found':
          this.toastNotification('El usuario no se encuentra registrado.');
          break;
        case 'auth/wrong-password':
          this.toastNotification('Combinación de clave y correo electrónico errónea.');
          break;
        default:
          this.toastNotification('Ocurrió un error durante el inicio de sesión.');
          break;
      }
    }
  }
  
 async toastNotification(mensaje: any) {
    let toast = this.toastCtrl.create({
      message: mensaje,
      duration: 3000,
      position: 'middle',
      icon: 'alert-outline',
      color: 'danger'
    });
    (await toast).present();
  }

  async getUser() {
    return firebase.auth().currentUser
  }


  logout() {
    firebase.auth().signOut().then(() => {
      this.router.navigate(['log']);
    });
  }
  
  async subirCredito(creditoObtenido: number, usuarioMail: string) {
    try {
      const user = this.usuarioAutenticado;
      if (!user) {
        throw new Error("Usuario no ingreso");
      }

      const photoRefCollection = firebase.firestore().collection('creditos');
      const credito = {
        usuario: usuarioMail,
        credito: creditoObtenido,
      };

      await photoRefCollection.add(credito);
    }
    
    catch (error) {
      console.log("Error subiendo los créditos.", error);
      throw error;
    }
    finally{
      this.dismissLoading();
    }
  }
  async vaciarCreditos(usuarioMail: string) {
    try {
      const user = this.usuarioAutenticado;
      if (!user) {
        throw new Error("Usuario no ingreso");
      }
  
      const photoRefCollection = firebase.firestore().collection('creditos');
      const snapshot = await photoRefCollection.where('usuario', '==', usuarioMail).get();
  
      const batch = firebase.firestore().batch();
      snapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
  
      await batch.commit();
    } catch (error) {
      console.log("Error vaciando los créditos.", error);
      throw error;
    }
  }
  
  async contarCreditos(usuario: string, credito: number): Promise<number> {
    try {
      const creditosRef = firebase.firestore().collection('creditos');
      const querySnapshot = await creditosRef.where('usuario', '==', usuario).where('credito', '==', credito).get();
      return querySnapshot.size;
    } catch (error) {
      console.log("Error contando los créditos.", error);
      throw error;
    }finally{
      this.dismissLoading();
    }
  }
  
  private creditosSource = new BehaviorSubject<number>(0);
  creditos$ = this.creditosSource.asObservable();

  setCreditos(creditos: number) {
    this.creditosSource.next(creditos);
  }


  async sumarCreditos(usuario: string): Promise<number> {
    try {
      const creditosRef = firebase.firestore().collection('creditos');
      const query = creditosRef.where('usuario', '==', usuario);
      const snapshot = await query.get();
      if (snapshot.empty) {
        return 0;
      }
      let totalCreditos = 0;
      snapshot.forEach((doc) => {
        const credito = doc.data()['credito'];
        if (typeof credito === 'number') {
          totalCreditos += credito;
        }
      });
      return totalCreditos;
    } catch (error) {
      console.error('Error al calcular la suma de créditos:', error);
      throw error;
    }
    finally{
      this.dismissLoading();
    }
  }
  
   async showLoading(mensaje:string) {
    const loading = await this.loadingCtrl.create({
      message: mensaje,
      translucent:true,
      duration:6000,
      cssClass: 'custom-loading',
      showBackdrop: false,
      backdropDismiss:false,
    });
    loading.present();
    return new Promise<void>((resolve) => setTimeout(() => resolve(), 3000));
  }
  async dismissLoading() {
    await this.loadingCtrl.dismiss();
  }
  
}
