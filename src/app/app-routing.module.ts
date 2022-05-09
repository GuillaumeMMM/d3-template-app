import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MapboxD3Component } from './components/mapbox-d3/mapbox-d3.component';
import { StoryComponent } from './components/story/story.component';

const routes: Routes = [
  {path: '', component: MapboxD3Component},
  {path: 'story', component: StoryComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
