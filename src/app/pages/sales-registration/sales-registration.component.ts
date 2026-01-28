import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SalesService } from 'src/app/services/sales.service';

@Component({
  selector: 'app-sales-registration',
  templateUrl: './sales-registration.component.html'
})
export class SalesRegistrationComponent implements OnInit {

  previewMode = false;

  oems: any[] = [];
  states: any[] = [];

  designations = ['Sales Manager', 'GM', 'Accounts', 'CFO'];

  salesForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private salesService: SalesService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.createForm();

    this.salesService.getOEMs().subscribe(oems => this.oems = oems);
    this.salesService.getStates().subscribe(states => this.states = states);
     // ✅ AUTO-CAPTURE LOCATION WHEN APP RUNS
  //this.captureLiveLocation();
  }

  createForm() {
    this.salesForm = this.fb.group({
       asmname:['', Validators.required],
      dealerName: ['', Validators.required],            // ✅ Mandatory
      contactPerson: ['', Validators.required],         // ✅ Mandatory
      designation: [''],

      contactNumber: [
        '',
        [
          Validators.required,                          // ✅ Mandatory
          Validators.pattern(/^[0-9]{10}$/)              // ✅ 10 digits
        ]
      ],

      state: [''],
      city: [''],

      oem: ['', Validators.required],                   // ✅ Mandatory

      email: ['', Validators.email],
      
    
    latitude: [''],
    longitude: [''],
    mapLink: [''],
      status: ['Submitted']
    });
  }

showPreview() {
  if (this.salesForm.invalid) {
    this.salesForm.markAllAsTouched();
    return;
  }

  if (!navigator.geolocation) {
    this.toastr.error('Geolocation not supported');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      // 🔗 Google Maps live link
      const mapLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

      // ✅ Patch into form (NO UI change)
      this.salesForm.patchValue({
        latitude,
        longitude,
        mapLink
      });

      this.previewMode = true;
    },
    (error) => {
      this.toastr.error('Unable to capture location. Please allow location access.');
    },
    {
      enableHighAccuracy: false,
      timeout: 15000,
      maximumAge: 60000
    }
  );
}


//   submitForm() {
//   if (this.salesForm.invalid) return;

//   const { latitude, longitude, ...rest } = this.salesForm.value;

//   const payload = {
//     ...rest,

//     // ✅ GeoJSON location
//     location: {
//       type: 'Point',
//       coordinates: [longitude, latitude] // [lng, lat]
//     },

//     // ✅ Geo API Metadata (NOW WILL BE SAVED)
//     geoApiMetaData: {
//       source: 'browser-geolocation',
//       accuracy: 'high',
//       latitude,
//       longitude,
//       capturedAt: new Date().toISOString(),
//       userAgent: navigator.userAgent
//     }
//   };

//   // ✅ SEND PAYLOAD (FIX)
//   this.salesService.createSales(payload).subscribe({
//     next: () => {
//       this.toastr.success('Sales registration submitted successfully');
//       this.previewMode = false;
//       this.salesForm.reset({ status: 'Submitted' });
//     },
//     error: () => {
//       this.toastr.error('Failed to submit sales details');
//     }
//   });
// }
submitForm() {

  if (this.salesForm.invalid) {
    this.salesForm.markAllAsTouched();
    return;
  }

  // ✅ Extract mapLink properly
  const { latitude, longitude, mapLink, ...rest } = this.salesForm.value;

  if (!latitude || !longitude || !mapLink) {
    this.toastr.error('Location not captured');
    return;
  }

  const payload = {
    ...rest,

    // ✅ GeoJSON location
    location: {
      type: 'Point',
      coordinates: [longitude, latitude]
    },

    // ✅ Geo API Metadata
    geoApiMetaData: {
      source: 'browser-geolocation',
      accuracy: 'standard',
      latitude,
      longitude,
      mapLink,
      capturedAt: new Date().toISOString(),
      userAgent: navigator.userAgent
    },

    // ✅ Store map link directly
    mapLink
  };

  this.salesService.createSales(payload).subscribe({
    next: () => {
      this.toastr.success('Sales registration submitted successfully');
      this.salesForm.reset({ status: 'Submitted' });
      this.previewMode = false;
    },
    error: () => {
      this.toastr.error('Failed to submit sales details');
    }
  });
}



  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
//   captureLiveLocation() {
//   if (!navigator.geolocation) {
//     this.toastr.error('Geolocation not supported');
//     return;
//   }

//   navigator.geolocation.getCurrentPosition(
//     (position) => {
//       this.salesForm.patchValue({
//         latitude: position.coords.latitude,
//         longitude: position.coords.longitude
//       });

//       console.log('Location captured:', position.coords);
//     },
//     (error) => {
//       this.toastr.error('Failed to capture location');
//       console.error(error);
//     },
//     {
//       enableHighAccuracy: true,
//       timeout: 15000,
//       maximumAge: 0
//     }
//   );
// }


captureLiveLocation() {
  if (!navigator.geolocation) {
    this.toastr.error('Geolocation not supported');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      this.salesForm.patchValue({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });

      this.toastr.success('Location captured successfully');
    },
    (error) => {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          this.toastr.error('Location permission denied');
          break;
        case error.POSITION_UNAVAILABLE:
          this.toastr.error('Location unavailable');
          break;
        case error.TIMEOUT:
          this.toastr.error('Location request timed out');
          break;
        default:
          this.toastr.error('Failed to get location');
      }
    },
    {
      enableHighAccuracy: false, // 🔥 important for mobile
      timeout: 20000,
      maximumAge: 60000
    }
  );
}

}

