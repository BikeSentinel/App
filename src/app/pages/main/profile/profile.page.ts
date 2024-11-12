import { Component, Input, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Product } from 'src/app/models/product.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  firebaseSvc = inject(FirebaseService);
  utilSvc = inject(UtilsService);



  ngOnInit() {
  }

  user(): User {
    return this.utilSvc.getFromLocalStorage('user');
  }

  //==Tomar foto==
  async takeImage() {



    let user = this.user();

    let path = `users/${user.uid}`



    const dataUrl = (await this.utilSvc.takePicture('Imagen del perfil')).dataUrl;

    const loading = await this.utilSvc.loading();
    await loading.present();

    let imagePath = `${user.uid}/profile`;
    user.image = await this.firebaseSvc.uploadImage(imagePath, dataUrl);


    this.firebaseSvc.updateDocument(path, { image: user.image }).then(async res => {

      this.utilSvc.saveInLocalStorage('user', user);

      this.utilSvc.presentToast({
        message: 'Imagen actualizada exitosamente',
        duration: 1500,
        color: 'success',
        position: 'middle',
        icon: 'checkmark-circle-outline'
      })


    }).catch(error => {
      console.log(error);
      this.utilSvc.presentToast({
        message: error.message,
        duration: 2500,
        color: 'primary',
        position: 'middle',
        icon: 'alet-circle-outline'
      })
    }).finally(() => {
      loading.dismiss();
    })




  }

}
