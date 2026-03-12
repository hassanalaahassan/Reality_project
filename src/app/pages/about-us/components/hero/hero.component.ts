import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about-hero',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section
      class="relative h-[80vh] min-h-[600px] flex items-center justify-center bg-cover bg-center bg-fixed"
      style="background-image: url('about/bg-hero.jpg')"
    >
      <div
        class="absolute inset-0 bg-realty-sage-200/80 mix-blend-multiply"
      ></div>
      <div
        class="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white"
      >
        <h1
          class="text-4xl md:text-6xl font-extrabold mb-6 animate-fade-in text-realty-blue-500"
        >
          We are Reality
        </h1>
        <p
          class="text-xl md:text-2xl mb-10 max-w-3xl mx-auto opacity-90 animate-fade-in delay-100 font-light leading-relaxed"
        >
          Our vision goes beyond simply selling real estate; we build
          communities and shape a future that matches your unique aspirations
          and lifestyle.
        </p>
        <div
          class="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in delay-200"
        >
          <a
            routerLink="/contact"
            class="px-8 py-4 bg-realty-terracotta-500 text-white font-bold rounded-lg shadow-lg hover:bg-[#A84A3B] transition-colors duration-300 transform hover:scale-105"
          >
            Contact Us Now
          </a>
          <a
            href="#our-story"
            class="px-8 py-4 bg-transparent border-2 border-realty-cream-500 text-realty-cream-500 font-bold rounded-lg hover:bg-realty-cream-500 hover:text-realty-blue-500 transition-colors duration-300"
          >
            Discover More
          </a>
        </div>
      </div>
    </section>
  `,
})
export class HeroComponent {
}
