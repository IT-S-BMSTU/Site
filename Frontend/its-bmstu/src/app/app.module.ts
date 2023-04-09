import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppComponent} from './app.component';
import {NavigationBarComponent} from './pages/navigation-bar/navigation-bar.component';
import {MainPageHeaderCardComponent} from './pages/main-page/header/main-page-header-card.component';
import {RouterModule, RouterOutlet} from "@angular/router";
import {EventPageComponent} from './pages/event-page/event-page.component';
import {AppRoutingModule} from './app-routing.module';
import {AboutUsComponent} from './pages/main-page/about-us/about-us.component';
import {InfographicsComponent} from "./pages/main-page/infographics/infographics.component";
import {OurPartnersComponent} from "./pages/main-page/our-partners/our-partners.component";
import {ContactsComponent} from "./pages/contacts/contacts.component";
import {FooterComponent} from "./pages/footer/footer.component";
import {IvyCarouselModule} from "./carousel/carousel.module";
import {SlickCarouselModule} from "ngx-slick-carousel";
import {EventsCollectionComponent} from './pages/main-page/events-collection/events-collection.component';
import {MainPageComponent} from './pages/main-page/main-page.component';

@NgModule({
  declarations: [
    AppComponent,
    NavigationBarComponent,
    MainPageHeaderCardComponent,
    EventPageComponent,
    AboutUsComponent,
    InfographicsComponent,
    OurPartnersComponent,
    ContactsComponent,
    FooterComponent,
    EventsCollectionComponent,
    MainPageComponent
  ],
  imports: [
    BrowserModule,
    RouterOutlet,
    AppRoutingModule,
    IvyCarouselModule,
    SlickCarouselModule,
    RouterModule.forRoot([
      {path: '', component: MainPageComponent, pathMatch: 'full'},
      // {path: 'todo', component: TodosAppComponent},
      // {path: 'cv', component: ProgrammerAppComponent,},
    ]),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
