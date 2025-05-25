import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css'
})
export class PaginationComponent implements OnChanges {
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Output() pageChange = new EventEmitter<number>();

  pages: number[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['totalPages'] || changes['currentPage']) {
      this.generatePagesArray();
    }
  }

  private generatePagesArray(): void {
    this.pages = [];

    // Always include first page
    this.pages.push(1);

    // Current page and some pages before and after current
    const startPage = Math.max(2, this.currentPage - 1);
    const endPage = Math.min(this.totalPages - 1, this.currentPage + 1);

    // Add ellipsis after first page if needed
    if (startPage > 2) {
      this.pages.push(-1); // -1 represents ellipsis
    }

    // Add pages between start and end
    for (let i = startPage; i <= endPage; i++) {
      this.pages.push(i);
    }

    // Add ellipsis before last page if needed
    if (endPage < this.totalPages - 1) {
      this.pages.push(-1); // -1 represents ellipsis
    }

    // Always include last page if it's not the first
    if (this.totalPages > 1) {
      this.pages.push(this.totalPages);
    }
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.changePage(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.changePage(this.currentPage + 1);
    }
  }
}
