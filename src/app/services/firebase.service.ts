import { Injectable, inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { User } from '../models/user.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getFirestore, setDoc, doc, getDoc, addDoc, collection,collectionData,query,updateDoc,deleteDoc } from '@angular/fire/firestore';
import { UtilsService } from './utils.service';
import{AngularFireStorage} from '@angular/fire/compat/storage';
import{getStorage,uploadString,ref,getDownloadURL, deleteObject}from "firebase/storage"

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  auth = inject(AngularFireAuth);
  firestore = inject(AngularFirestore);
  storage = inject (AngularFireStorage);
  utilSvc = inject(UtilsService);


  //==Autenticacion==
  getAuth() {
    return getAuth();
  }

  //==Ingresar==
  signIn(user: User) {
    return signInWithEmailAndPassword(getAuth(), user.email, user.password)

  }
  //==crear usuario
  signUp(user: User) {
    return createUserWithEmailAndPassword(getAuth(), user.email, user.password)

  }

  //==Actualizar usu
  updateUser(displayName: string) {
    return updateProfile(getAuth().currentUser, { displayName })


  }

  //===Restablecer contraseña==
  sendRecoveryEmail(email: string) {
    return sendPasswordResetEmail(getAuth(), email);

  }

  //==Cerrar Sesion==
  signOut() {
    getAuth().signOut();
    localStorage.removeItem('user');
    this.utilSvc.routerLink('/auth');

  }



  //Base de datos=====





  //Obtener documentos de una coleccion===
  getCollectionData(path: string, collectionQuery?:any){
    const ref= collection(getFirestore(), path);
    return collectionData(query(ref,...collectionQuery), {idField:'id'});


  }
  //SetearDocumentos=====

  setDocument(path: string, data: any) {
    return setDoc(doc(getFirestore(), path), data)

  }

   //ActualizarDocumentos=====

   updateDocument(path: string, data: any) {
    return updateDoc(doc(getFirestore(), path), data)

  }


  //EliminarDocumentos=====

  deleteDocument(path: string) {
    return deleteDoc(doc(getFirestore(), path))

  }

  //Obtenerundocumento============
  async getDocument(path: string) {
    return (await getDoc(doc(getFirestore(), path))).data();

  }
  //Agregardocumento
  addDocument(path: string, data: any) {
    return addDoc(collection(getFirestore(), path), data)

  }

  //Almacenamiento
  //Subir imagen
  async uploadImage(path: string, data_url: string){
    return uploadString(ref(getStorage(),path), data_url,'data_url').then(()=>{
      return getDownloadURL(ref(getStorage(),path))

    })
  }
  //Obtener ruta imagen
  async getFilePath(url:string){
    return ref(getStorage(),url).fullPath

  }

  //Eliminar Imagen
  deleteFile(path:string){
    return deleteObject(ref(getStorage(),path));

  }
}
