import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';

import { LayoutService } from '../../../Services/layout.service';
import { AuthService } from '../../../Services/auth.service';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  badge?: string | number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  layoutService = inject(LayoutService);
  authService = inject(AuthService);
  router = inject(Router);

  readonly isSidebarExpanded = this.layoutService.isSidebarExpanded;
  readonly isSidebarPinned = this.layoutService.isSidebarPinned;
  readonly user = this.authService.currentUser;

  activeItem = 'home';

  get isCollapsed() {
    return !this.isSidebarExpanded();
  }

  menuItems = computed(() => {
    const items: MenuItem[] = [
      { id: 'home', label: 'Home', route: '/user-home', icon: '🏠' },
      {
        id: 'properties',
        label: 'Properties',
        route: '/properties',
        icon: '🏢',
      },
      { id: 'saved', label: 'Saved', route: '/fav-properties', icon: '❤️' },
      {
        id: 'vip',
        label: 'VIP Properties',
        route: '/vip',
        icon: '⭐',
        badge: 'NEW',
      },
      { id: 'profile', label: 'My Profile', route: '/profile', icon: '👤' },
      { id: 'contact', label: 'Contact Us', route: '/contact', icon: '📞' },
      { id: 'about', label: 'About Us', route: '/about', icon: 'ℹ️' },
    ];
    if (this.user()?.profile?.isAgent) {
      items.push({
        id: 'add-property',
        label: 'Add Property',
        route: '/add-property',
        icon: '➕',
      });
    }
    return items;
  });

  get sidebarClasses(): string {
    const baseClasses =
      'fixed top-0 left-0 flex flex-col h-[100dvh] bg-white border-r border-realty-gray-200 shadow-xl transition-all duration-300 ease-in-out z-50';
    const widthClass = this.isCollapsed ? 'w-20' : 'w-64';
    return `${baseClasses} ${widthClass}`;
  }

  getMenuItemClasses(itemId: string): string {
    const baseClasses =
      'group relative flex items-center rounded-lg px-4 py-3 text-realty-gray-700 hover:bg-realty-blue-50 hover:text-realty-blue-600 transition-all duration-300 overflow-hidden';
    const activeClass =
      this.activeItem === itemId
        ? 'bg-realty-blue-50 text-realty-blue-600 shadow-sm active-menu'
        : '';
    return `${baseClasses} ${activeClass}`;
  }

  toggleSidebar(): void {
    this.layoutService.toggleSidebar();
  }

  setActiveItem(itemId: string): void {
    this.activeItem = itemId;

    if (window.innerWidth < 768 && !this.isCollapsed) {
      this.layoutService.closeMobileSidebar();
    }
  }

  onMouseEnter(): void {
    this.layoutService.setHoverState(true);
  }

  onMouseLeave(): void {
    this.layoutService.setHoverState(false);
  }

  logout() {
    this.authService.logout().subscribe();
    this.router.navigate(['/login']);
  }
}
