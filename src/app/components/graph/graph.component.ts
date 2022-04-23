import { AfterViewInit, Component, ElementRef, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { asyncScheduler, BehaviorSubject, map, Subject, takeUntil, throttleTime } from 'rxjs';
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
  private margin: { top: number, right: number, left: number, bottom: number } = {
    top: 0, left: 0, right: 0, bottom: 0
  };
  private svg: d3.Selection<any, unknown, null, undefined> = d3.select(null);
  private graphContainer: d3.Selection<any, unknown, null, undefined> = d3.select(null);
  private destroySubject$: Subject<void> = new Subject;

  public tree: string = '';
  private zoom$: BehaviorSubject<number> = new BehaviorSubject(1);

  ngOnInit(): void {
    this.windowService.windowResize$.pipe(
      takeUntil(this.destroySubject$),
      throttleTime(1000, asyncScheduler, { leading: false, trailing: true })
    ).subscribe(newSize => {
      this.width = (this.el.nativeElement as HTMLElement).getBoundingClientRect().width;
      this.height = (this.el.nativeElement as HTMLElement).getBoundingClientRect().height;

      this.resetSVG();
      this.initSVG(this.width, this.height);
      this.initGraph();
      this.initDrag();
    });

    this.zoom$.pipe(
      throttleTime(1000, asyncScheduler, { leading: true, trailing: true }),
      map(zoom => {
        this.updateGraphForZoom(zoom);
      })).subscribe();
  }

  ngAfterViewInit() {
    this.width = (this.el.nativeElement as HTMLElement).getBoundingClientRect().width;
    this.height = (this.el.nativeElement as HTMLElement).getBoundingClientRect().height;
    this.initSVG(this.width, this.height);
    this.initGraph();
    this.initDrag();
  }

  private initSVG = (width: number, height: number): void => {
    this.svg = d3.select(this.el.nativeElement)
      .select('#chart')
      .append('svg')
      .attr('width', `${width}px`)
      .attr('height', `${height}px`);

    this.graphContainer = this.svg.append('g').attr('class', 'svg-graph-container')
  }

  private initGraph = () => {

    d3.json('../../../assets/les-arbres-plantes.geojson').then((geojsonArbres: any) => {
      d3.json('../../../assets/arrondissements.geojson').then((geojson: any) => {

        const colelction = { ...geojson, features: geojsonArbres.features };
        const projection = d3.geoConicConformal().center([2.349014, 48.864716])
          .fitSize([this.width, this.height], colelction);
          

        const path = d3.geoPath(projection);

        const deps = this.graphContainer.append("g");
        deps.selectAll("path")
          .data(geojson.features)
          .enter()
          .append("path")
          .attr('stroke', 'pink')
          .attr('stroke-width', 1)
          .attr('fill', 'none')
          .attr("d", path as any);

        const arbres = this.graphContainer.append("g");
        arbres.selectAll("path")
          .data(geojsonArbres.features)
          .enter()
          .append("circle")
          .attr('r', '3px')
          .on('mouseover', (e, d: any) => {
            this.tree = d.properties.dateplantation
          })
          .on('mouseout', (e, d: any) => {
            this.tree = '';
          })
          .attr('stroke', 'red')
          .attr('stroke-width', 1)
          .attr('fill', 'lightgreen')
          .attr('cx', (d, i) => {
            const coordinates = projection((d as any).geometry.coordinates)
            return coordinates && coordinates[0] ? coordinates[0] : '0px';
          })
          .attr('cy', (d, i) => {
            const coordinates = projection((d as any).geometry.coordinates)
            return coordinates && coordinates[1] ? coordinates[1] : '0px';
          });

      });

    });
  }

  private initDrag = () => {
    this.svg.call(
      d3.zoom().on("zoom", (event) => {
        this.zoom$.next(event.transform.k);
        this.graphContainer.attr("transform", event.transform)
      }).scaleExtent([1, 10])
    )
  }

  private resetSVG = (): void => {
    d3.select(this.el.nativeElement).select('#chart').selectAll('*').remove();
  }

  private updateSVGSize = (width: number, height: number): void => {
    this.graphContainer.attr('width', width).attr('height', height);
  }

  private updateGraphForZoom = (zoom: number) => {
    this.svg.selectAll('circle')
      .attr('r', `${1 + (2 / zoom)}px`)
      .attr('stroke-width', `${0.5 + (0.5 / zoom)}px`);
  }

  ngOnDestroy() {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }

}
