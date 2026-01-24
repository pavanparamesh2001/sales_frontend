import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SalesService } from 'src/app/services/sales.service';
import { saveAs } from 'file-saver';


@Component({
  selector: 'app-sales-dashboard',
  templateUrl: './sales-dashboard.component.html',
  styleUrls: ['./sales-dashboard.component.css']
})
export class SalesDashboardComponent implements OnInit {

  salesList: any[] = [];
  filteredList: any[] = [];
  oems: any[] = [];

  fromDate = '';
  toDate = '';

  // Modal properties
  isModalOpen = false;
  selectedSale: any = null;

  // Pagination properties
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;
  paginatedList: any[] = [];

  // Make Math available in template
  Math = Math;

  constructor(
    private salesService: SalesService,
    private router: Router
  ) {}

  ngOnInit() {
    this.salesService.getOEMs().subscribe(oems => {
      this.oems = oems;
      
      this.salesService.getSalesList().subscribe(res => {
        this.salesList = this.mapOemNames(res);
        this.filteredList = this.salesList;
        this.updatePagination();
      });
    });
  }

  mapOemNames(salesList: any[]): any[] {
    return salesList.map(sale => {
      if (sale.oem && typeof sale.oem === 'object' && sale.oem.name) {
        return sale;
      }
      
      if (sale.oem && typeof sale.oem === 'string') {
        const oemObj = this.oems.find(o => o._id === sale.oem);
        return {
          ...sale,
          oem: oemObj ? oemObj.name : sale.oem
        };
      }
      
      return sale;
    });
  }

  filterByDate() {
    const filtered = this.salesList.filter(item => {
      const created = new Date(item.createdAt).getTime();
      const from = this.fromDate ? new Date(this.fromDate).getTime() : 0;
      const to = this.toDate ? new Date(this.toDate).getTime() : Date.now();
      return created >= from && created <= to;
    });
    
    this.filteredList = filtered;
    this.currentPage = 1; // Reset to first page after filtering
    this.updatePagination();
  }

  // Pagination methods
  updatePagination() {
    this.totalPages = Math.ceil(this.filteredList.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedList = this.filteredList.slice(startIndex, endIndex);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  // Modal methods
  openModal(sale: any) {
    this.selectedSale = sale;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedSale = null;
  }

  onModalBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeModal();
    }
  }

  // Navigation method
  goToRegistration() {
    this.router.navigate(['/register']);
  }
 downloadExcel() {
  this.salesService.downloadSalesExcel(this.fromDate, this.toDate)
    .subscribe({
      next: (blob: Blob) => {
        const fileName = `Sales_Report_${this.fromDate || 'ALL'}_${this.toDate || 'ALL'}.xlsx`;
        saveAs(blob, fileName);
      },
      error: (err) => {
        console.error('Excel download failed:', err);
        alert('Failed to download Excel report ❌');
      }
    });
}


}
