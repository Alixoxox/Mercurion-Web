import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminProductService } from '../../../../core/services/admin-product.service';
import { UserService } from '../../../../core/services/user.service';

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.html',
})
export class AdminDashboard {
  private adminService = inject(AdminProductService);
  private userService = inject(UserService);

  products = this.adminService.products;
  userCount = signal(0);

  totalProducts = computed(() => this.products().length);
  totalStock = computed(() => this.products().reduce((sum, p) => sum + p.stock, 0));
  outOfStockCount = computed(() => this.products().filter(p => p.stock === 0).length);
  lowStockCount = computed(() => this.products().filter(p => p.stock > 0 && p.stock <= 5).length);
  inventoryValue = computed(() => this.products().reduce((sum, p) => sum + p.price * p.stock, 0));
  avgPrice = computed(() => {
    const list = this.products();
    return list.length ? list.reduce((sum, p) => sum + p.price, 0) / list.length : 0;
  });

  categories = computed(() => {
    const map = new Map<string, number>();
    for (const p of this.products()) map.set(p.category, (map.get(p.category) ?? 0) + 1);
    return [...map.entries()].map(([name, count]) => ({ name, count }));
  });

  maxCategory = computed(() => Math.max(...this.categories().map(c => c.count), 1));

  pieSegments = computed(() => {
    const cats = this.categories();
    const total = cats.reduce((sum, c) => sum + c.count, 0);
    let accDeg = 0;
    return cats.map((c, i) => {
      const pct = total ? (c.count / total) * 100 : 0;
      const seg = {
        name: c.name,
        count: c.count,
        pct,
        color: PIE_COLORS[i % PIE_COLORS.length],
        offsetDeg: accDeg,
      };
      accDeg += pct * 3.6;
      return seg;
    });
  });

  pieGradient = computed(() => {
    const segs = this.pieSegments();
    if (!segs.length) return 'conic-gradient(#e5e7eb 0deg 360deg)';
    return `conic-gradient(${segs.map(s => `${s.color} ${s.offsetDeg}deg ${s.offsetDeg + s.pct * 3.6}deg`).join(', ')})`;
  });

  outOfStockProducts = computed(() => this.products().filter(p => p.stock === 0));

  ngOnInit(): void {
    this.adminService.load();
    this.userService.getUserCount().subscribe({
      next: (count) => {this.userCount.set(count); console.log("User count updated" + count) },
      error:(err) => {console.error("Failed to fetch user count", err, "User count remains at", this.userCount())}
    });
  }
}