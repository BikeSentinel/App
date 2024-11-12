import { Component, inject, OnInit } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-gps',
  templateUrl: './gps.page.html',
  styleUrls: ['./gps.page.scss'],
})
export class GpsPage implements OnInit {
  map: any;
  firebaseSvc = inject(FirebaseService);
  utilSvc = inject(UtilsService);

  constructor() {}
  ionViewDidEnter() {
    this.loadMap();
  }
  
  ngOnInit() {
    
  }

  loadMap() {
    this.map = L.map('map').setView([0, 0], 15);  // Inicia en coordenadas (0,0) con zoom 15
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data © OpenStreetMap contributors'
    }).addTo(this.map);
  }

  async getCurrentLocation() {
    try {
      // Captura las coordenadas actuales
      const coordinates = await Geolocation.getCurrentPosition();
      const lat = coordinates.coords.latitude;
      const lng = coordinates.coords.longitude;

      // Muestra la ubicación en el mapa
      if (this.map) {
        this.map.setView([lat, lng], 15);
        L.marker([lat, lng]).addTo(this.map);
      }

      // Obtiene el userId del usuario almacenado en el local storage
      const user = await this.utilSvc.getFromLocalStorage('users');
      const userId = user ? user.uid : null;

      if (userId) {
        // Guarda las coordenadas en Firebase bajo users/{userId}/gps
        const gpsData = {
          lat,
          lng,
          timestamp: new Date().toISOString() // Guarda la fecha y hora de la última actualización
        };

        await this.firebaseSvc.updateDocument(`users/${userId}/gps`, gpsData);

        // Muestra un mensaje de éxito
        this.utilSvc.presentToast({
          message: 'Ubicación actualizada en Firebase',
          duration: 1500,
          color: 'primary'
        });
      } else {
        console.error("Error: Usuario no encontrado.");
      }
    } catch (error) {
      console.error("Error obteniendo la ubicación o guardando en Firebase", error);
      this.utilSvc.presentToast({
        message: 'Error al obtener o guardar la ubicación',
        duration: 2500,
        color: 'danger'
      });
    }
  }
}
