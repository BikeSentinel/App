import { Component, OnInit, inject } from '@angular/core';
import { Product } from 'src/app/models/product.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddUpdateProductComponent } from 'src/app/shared/components/add-update-product/add-update-product.component';
import {orderBy,where} from 'firebase/firestore';
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  firebaseSvc= inject (FirebaseService);
  utilsSvc= inject (UtilsService);

  products:Product[]=[];

  loading:boolean=false;

  ngOnInit() {
  }


  user(): User{
    return this.utilsSvc.getFromLocalStorage('user');
  }

  ionViewWillEnter() {
    this.getProducts();
  }
  doRefresh(event) {

    setTimeout(() => {
      this.getProducts();
      event.target.complete();
    }, 1000);
  }
  //======Obtener productos
  getProducts(){
    let path = `users/${this.user().uid}/products`;

    this.loading= true;

    let query=[
      orderBy('soldUnits','desc'),
      //where('soldUnits','>',30)
    ]
      
    

    let sub = this.firebaseSvc.getCollectionData(path,query).subscribe({
      next: (res:any)=>{
        console.log(res);
        this.products=res;

    this.loading= false;
        sub.unsubscribe();
      }

    })


  }

    //==Agregar o actualizar producto
    async addUpdateProduct(product?:Product){
      let success= await this.utilsSvc.presentModal({
        component: AddUpdateProductComponent,
        cssClass:'add-update-modal',
        componentProps:{product}

      })

      if(success) this.getProducts();

    }

//Confirmacion eliminar producto
async confirmDeleteProduct(product:Product) {
  this.utilsSvc.presentAlert({
    header: 'Eliminar Producto',
    message: '¿Quieres eliminar esta motocicleta',
    mode:'ios',
    buttons: [
      {
        text: 'Cancelar',
       
      }, {
        text: 'Si, estoy seguro de eliminar',
        handler: () => {
          this.deleteProduct(product);
        }
      }
    ]
  });

 
}

//Eliminar producto
    async deleteProduct(product:Product) {
    

      let path = `users/${this.user().uid}/products/${product.id}`

      const loading = await this.utilsSvc.loading();
      await loading.present();
      let imagePath = await this.firebaseSvc.getFilePath(product.image);
      await this.firebaseSvc.deleteFile(imagePath);


    


      this.firebaseSvc.deleteDocument(path ).then(async res => {
        
        this.products= this.products.filter(p => p.id !== product.id);

        this.utilsSvc.presentToast({
          message: 'Motocicleta eliminada exitosamente',
          duration: 1500,
          color: 'success',
          position: 'middle',
          icon: 'checkmark-circle-outline'
        })

        
      }).catch(error => {
        console.log(error);
        this.utilsSvc.presentToast({
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
