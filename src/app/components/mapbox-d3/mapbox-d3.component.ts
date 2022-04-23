import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { asyncScheduler, Subject, takeUntil, throttleTime } from 'rxjs';
import { WindowService } from 'src/app/services/window.service';
import mapboxgl from 'mapbox-gl';
import * as d3 from 'd3';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-mapbox-d3',
  templateUrl: './mapbox-d3.component.html',
  styleUrls: ['./mapbox-d3.component.scss']
})
export class MapboxD3Component implements OnInit, AfterViewInit, OnDestroy {

  constructor(private el: ElementRef, private windowService: WindowService) { }

  private destroySubject$: Subject<void> = new Subject;
  private width: number = 0;
  private height: number = 0;
  private svg: d3.Selection<any, unknown, null, undefined> = d3.select(null);
  private graphContainer: d3.Selection<any, unknown, null, undefined> = d3.select(null);
  private map: mapboxgl.Map | undefined;

  ngOnInit(): void {
    this.windowService.windowResize$.pipe(
      takeUntil(this.destroySubject$),
      throttleTime(1000, asyncScheduler, { leading: false, trailing: true })
    ).subscribe(newSize => {
      this.width = (this.el.nativeElement as HTMLElement).getBoundingClientRect().width;
      this.height = (this.el.nativeElement as HTMLElement).getBoundingClientRect().height;

      /* this.resetSVG();
      this.initSVG(this.width, this.height);
      this.initGraph(); */
    });
  }

  ngAfterViewInit() {
    this.width = (this.el.nativeElement as HTMLElement).getBoundingClientRect().width;
    this.height = (this.el.nativeElement as HTMLElement).getBoundingClientRect().height;
    this.initSVG(this.width, this.height);
  }

  private initSVG = (width: number, height: number): void => {
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/guillaumemmm/cl1l2bik7000n15plm468rsxh',
      center: [2.349014, 48.864716],
      zoom: 10,
      accessToken: environment.mapboxToken
      /* accessToken: 'pk.eyJ1IjoiZ3VpbGxhdW1lbW1tIiwiYSI6ImNqeGgydDBvYzB3YjYzdmxpMXVodWxqM3gifQ.sIm22fQjZ-B4yY72oKxSyQ' */
    });

    const container = this.map.getCanvasContainer();
    this.svg = d3.select(container)
      .append("svg")
      .attr('width', `${width}px`)
      .attr('height', `${height}px`)
      .style("position", "absolute")
      .style('left', '0px')
      .style('top', '0px')
      .style("z-index", 2);

    this.graphContainer = this.svg.append('g').attr('class', 'svg-graph-container');

    d3.json('../../../assets/les-arbres-plantes.geojson').then((geojsonArbres: any) => {
      const arbres = this.graphContainer.append("g");
      arbres.selectAll("path")
        .data(geojsonArbres.features)
        .enter()
        .append("circle")
        .attr('r', '3px')
        .attr('stroke', 'red')
        .attr('stroke-width', 1)
        .attr('fill', 'lightgreen')

      this.map?.on("viewreset", this.render);
      this.map?.on("move", this.render);
      this.map?.on("moveend", this.render);
      this.render();
    });
  }

  private project = (d: number[]) => {
    return this.map?.project(new mapboxgl.LngLat(d[0], d[1]));
  }

  private render = (): void => {
    this.graphContainer.selectAll('circle')
      .attr('cx', (d, i) => {
        const coordinates = this.project((d as any).geometry.coordinates)
        return coordinates && coordinates.x ? `${coordinates.x}px` : '0px';
      })
      .attr('cy', (d, i) => {
        const coordinates = this.project((d as any).geometry.coordinates)
        return coordinates && coordinates.y ? `${coordinates.y}px` : '0px';
      });
  }

  ngOnDestroy() {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }

}
