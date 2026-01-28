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
      status: ['Submitted']
    });
  }

  showPreview() {
    if (this.salesForm.invalid) {
      this.salesForm.markAllAsTouched();
      return;
    }
    this.previewMode = true;
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

  // ❌ Stop if form invalid
  if (this.salesForm.invalid) {
    this.salesForm.markAllAsTouched();
    return;
  }

  const { latitude, longitude, ...rest } = this.salesForm.value;

  // ❌ Stop if location not captured (VERY IMPORTANT FOR MOBILE)
  if (!latitude || !longitude) {
    this.toastr.error('Please capture location before submitting');
    return;
  }

  const payload = {
    ...rest,

    // ✅ GeoJSON location (MongoDB compatible)
    location: {
      type: 'Point',
      coordinates: [longitude, latitude] // [lng, lat]
    },

    // ✅ Geo API Metadata
    geoApiMetaData: {
      source: 'browser-geolocation',
      accuracy: 'standard', // better for mobile
      latitude,
      longitude,
      capturedAt: new Date().toISOString(),
      userAgent: navigator.userAgent
    }
  };

  // ✅ API CALL
  this.salesService.createSales(payload).subscribe({
    next: () => {
      this.toastr.success('Sales registration submitted successfully');

      // reset but keep status
      this.salesForm.reset({
        status: 'Submitted'
      });

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

