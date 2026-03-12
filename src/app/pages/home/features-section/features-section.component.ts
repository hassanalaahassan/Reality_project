import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-features-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './features-section.component.html',
  styleUrls: ['./features-section.component.scss'],
})
export class FeaturesSectionComponent {
  features = [
    { icon: '🔍', title: 'Smart Search', desc: 'Find properties with advanced filters by location, price, area, and more.' },
    { icon: '🏢', title: 'Verified Listings', desc: 'Every property is reviewed and verified by trusted real estate agents.' },
    { icon: '💬', title: 'Direct Contact', desc: 'Connect directly with property owners and agents — no middlemen.' },
    { icon: '⭐', title: 'VIP Properties', desc: 'Access exclusive premium listings before anyone else.' },
    { icon: '📊', title: 'Market Insights', desc: 'Stay informed with real-time data and pricing trends.' },
    { icon: '🔒', title: 'Secure Platform', desc: 'Your data is protected with enterprise-grade security.' },
  ];
}
