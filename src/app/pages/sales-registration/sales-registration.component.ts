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
  this.captureLiveLocation();
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

  submitForm() {
  if (this.salesForm.invalid) return;

  const { latitude, longitude, ...rest } = this.salesForm.value;

  const payload = {
    ...rest,

    // ✅ GeoJSON location
    location: {
      type: 'Point',
      coordinates: [longitude, latitude] // [lng, lat]
    },

    // ✅ Geo API Metadata (NOW WILL BE SAVED)
    geoApiMetaData: {
      source: 'browser-geolocation',
      accuracy: 'high',
      latitude,
      longitude,
      capturedAt: new Date().toISOString(),
      userAgent: navigator.userAgent
    }
  };

  // ✅ SEND PAYLOAD (FIX)
  this.salesService.createSales(payload).subscribe({
    next: () => {
      this.toastr.success('Sales registration submitted successfully');
      this.previewMode = false;
      this.salesForm.reset({ status: 'Submitted' });
    },
    error: () => {
      this.toastr.error('Failed to submit sales details');
    }
  });
}


  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
  captureLiveLocation() {
  if (!navigator.geolocation) {
    this.toastr.error('Geolocation not supported by browser');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      this.salesForm.patchValue({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });

      console.log('Location captured:', position.coords);
    },
    (error) => {
      this.toastr.error('Failed to capture location');
      console.error(error);
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    }
  );
}



}

