import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class SalesService {

  private baseUrl = environment.apiUrl; // ✅ FIXED

  constructor(private http: HttpClient) {}

  getOEMs() {
    return this.http.get<any>(`${this.baseUrl}/oems`)
      .pipe(map(res => res.data));
  }

  getStates() {
    return this.http.get<any>(`${this.baseUrl}/states`)
      .pipe(map(res => res.data));
  }

  createSales(data: any) {
    return this.http.post(`${this.baseUrl}/sales`, data);
  }

  getSalesList() {
    return this.http.get<any>(`${this.baseUrl}/sales`);
  }

  downloadSalesExcel(fromDate?: string, toDate?: string) {
    const params: any = {};
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;

    return this.http.get(
      `${this.baseUrl}/sales/export/excel`,
      { params, responseType: 'blob' }
    );
  }
}

