import { AfterViewInit, Component, ElementRef, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { asyncScheduler, Subject, takeUntil, throttleTime } from 'rxjs';
import { WindowService } from 'src/app/services/window.service';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss']
})
export class GraphComponent implements OnInit, AfterViewInit {

  constructor(private el: ElementRef, private windowService: WindowService) { }

  private width: number = 0;
  private height: number = 0;
  private margin: {top: number, right: number, left: number, bottom: number} = {
    top: 0, left: 0, right: 0, bottom: 0
  };
  private svg: d3.Selection<any, unknown, null, undefined> = d3.select(null);
  private destroySubject$: Subject<void> = new Subject;

  ngOnInit(): void {
    this.windowService.windowResize$.pipe(
      takeUntil(this.destroySubject$),
      throttleTime(200, asyncScheduler, {leading: true, trailing: true})
    ).subscribe(newSize => {
      this.width = (this.el.nativeElement as HTMLElement).getBoundingClientRect().width;
      this.height = (this.el.nativeElement as HTMLElement).getBoundingClientRect().height;
      this.updateSVGSize(this.width, this.height);
    });
  }

  ngAfterViewInit() {
    this.width = (this.el.nativeElement as HTMLElement).getBoundingClientRect().width;
    this.height = (this.el.nativeElement as HTMLElement).getBoundingClientRect().height;
    this.initSVG(this.width, this.height);
  }

  private initSVG = (width: number, height: number): void => {
    this.svg = d3.select(this.el.nativeElement)
      .select('#chart')
      .append('svg')
        .attr('width', width)
        .attr('height', height);

      this.svg.append('rect')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('x', 0)
        .attr('y', 0)
        .attr('fill', 'pink')
        .attr('stroke', 'red')
        .attr('stroke-width', '5px');
  }

  private updateSVGSize = (width: number, height: number): void => {
    this.svg.attr('width', width).attr('height', height);
  }

  ngOnDestroy() {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }

}
