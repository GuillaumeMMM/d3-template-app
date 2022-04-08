import { Component } from '@angular/core';
import { WindowService } from './services/window.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'd3-template-app';

  constructor(private windowService: WindowService) {

  }

  public onResize = (event: any): void => {
    this.windowService.windowResize$.next([
      event.target?.innerWidth || 0,
      event.target?.innerHeight || 0
    ]);
  }
}
