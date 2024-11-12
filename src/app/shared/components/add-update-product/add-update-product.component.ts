import { Component, Input, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Product } from 'src/app/models/product.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-add-update-product',
  templateUrl: './add-update-product.component.html',
  styleUrls: ['./add-update-product.component.scss'],
})
export class AddUpdateProductComponent  implements OnInit {

  @Input() product:Product;

  form = new FormGroup({
    id: new FormControl(''),
    image: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required, Validators.minLength(4)]),
    price: new FormControl(null, [Validators.required, Validators.min(0)]),
    soldUnits: new FormControl(null, [Validators.required, Validators.min(0)]),
  })

  firebaseSvc = inject(FirebaseService);
  utilSvc = inject(UtilsService);

  user= {} as User;

  ngOnInit() {
    this.user = this.utilSvc.getFromLocalStorage('user');
    if (this.product) this.form.setValue(this.product);
  }


  //==Tomar foto==
  async takeImage (){
    const dataUrl = (await this.utilSvc.takePicture('Imagen del producto')).dataUrl;
    this.form.controls.image.setValue(dataUrl);


  }



  submit(){
    if (this.form.valid) {
      if(this.product)this.updateProduct();
      else this.createProduct()
    }



  }

//Covierte valores de string a number
  setNumberInputs(){
    let {soldUnits, price}= this.form.controls;
    if(soldUnits.value) soldUnits.setValue(parseFloat(soldUnits.value));
    if(price.value) price.setValue(parseFloat(price.value));

  }
  //Crear producto
  async createProduct() {
    

      let path = `users/${this.user.uid}/products`

      const loading = await this.utilSvc.loading();
      await loading.present();


      //Subir imagen y obtener url//
      let dataUrl= this.form.value.image;
      let imagepath=`${this.user.uid}/${Date.now()}`;
      let imageUrl = await this.firebaseSvc.uploadImage(imagepath,dataUrl);
      this.form.controls.image.setValue(imageUrl);

      delete this.form.value.id


      this.firebaseSvc.addDocument(path,this.form.value ).then(async res => {
        
        this.utilSvc.dismissModal({success : true});

        this.utilSvc.presentToast({
          message: 'Motocicleta agregada exitosamente',
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


  async updateProduct() {
    

      let path = `users/${this.user.uid}/products/${this.product.id}`

      const loading = await this.utilSvc.loading();
      await loading.present();


      //Subir imagen y obtener url//
      if(this.form.value.image !== this.product.image){
        let dataUrl= this.form.value.image;
        let imagepath= await this.firebaseSvc.getFilePath(this.product.image);
        let imageUrl = await this.firebaseSvc.uploadImage(imagepath,dataUrl);
        this.form.controls.image.setValue(imageUrl);
      }
     

      delete this.form.value.id


      this.firebaseSvc.updateDocument(path,this.form.value ).then(async res => {
        
        this.utilSvc.dismissModal({success : true});

        this.utilSvc.presentToast({
          message: 'Motocicleta actualizada exitosamente',
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
