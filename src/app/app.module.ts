import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GraphComponent } from './components/graph/graph.component';
import { PointDetailComponent } from './components/point-detail/point-detail.component';
import { MapboxD3Component } from './components/mapbox-d3/mapbox-d3.component';

@NgModule({
  declarations: [
    AppComponent,
    GraphComponent,
    PointDetailComponent,
    MapboxD3Component
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
