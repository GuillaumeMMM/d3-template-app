import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { asyncScheduler, Subject, takeUntil, throttleTime } from 'rxjs';
import { WindowService } from 'src/app/services/window.service';
import mapboxgl, { MapBoxZoomEvent } from 'mapbox-gl';
import * as d3 from 'd3';
import { environment } from 'src/environments/environment';
import { EmojiService } from 'src/app/services/emoji.service';
import { ClusterService } from 'src/app/services/cluster.service';
import { FeatureTree, TreeGroup } from 'src/app/models/arbre';

@Component({
  selector: 'app-mapbox-d3',
  templateUrl: './mapbox-d3.component.html',
  styleUrls: ['./mapbox-d3.component.scss']
})
export class MapboxD3Component implements OnInit, AfterViewInit, OnDestroy {

  constructor(private el: ElementRef, private windowService: WindowService, private clusterService: ClusterService) { }

  private destroySubject$: Subject<void> = new Subject;
  private width: number = 0;
  private height: number = 0;
  private svg: d3.Selection<any, unknown, null, undefined> = d3.select(null);
  private graphContainer: d3.Selection<any, unknown, null, undefined> = d3.select(null);
  private map: mapboxgl.Map | undefined;
  private zoomLevelSnapshot: number = 10;
  private zoomLevel: number = 10;

  private treesData: TreeGroup[] = [];
  private geoJsonData: FeatureTree[] = [];
  private displayedTreesData: TreeGroup[] = [];

  ngOnInit(): void {
    this.windowService.windowResize$.pipe(
      takeUntil(this.destroySubject$),
      throttleTime(1000, asyncScheduler, { leading: false, trailing: true })
    ).subscribe(newSize => {
      this.width = (this.el.nativeElement as HTMLElement).getBoundingClientRect().width;
      this.height = (this.el.nativeElement as HTMLElement).getBoundingClientRect().height;
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
      minZoom: 7.5,
      maxZoom: 17,
      zoom: this.zoomLevelSnapshot,
      accessToken: environment.mapboxToken
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

    this.graphContainer.append('g').attr('class', 'emojis-container');

    d3.json('../../../assets/les-arbres-plantes.geojson')
      .then((geojsonArbres) => {

      this.geoJsonData = (geojsonArbres as {features: FeatureTree[]}).features;
      this.treesData = this.clusterService.getClusterData(this.geoJsonData.slice());
      this.displayedTreesData = this.treesData.slice();
      
      this.map?.on("viewreset", this.render);
      this.map?.on("move", this.onMove);
      this.map?.on("moveend", this.render);
      this.render();
    });
  }

  private project = (d: number[]) => {
    return this.map?.project(new mapboxgl.LngLat(d[0], d[1]));
  }

  private onMove = (event: WheelEvent) => {
    if (this.zoomLevel !== this.map?.getZoom() as number) {
      this.updateData(this.zoomLevel < (this.map?.getZoom() as number));
    }

    this.zoomLevel = this.map?.getZoom() as number;
    if (event.type === 'move' && Math.abs(this.zoomLevel - this.zoomLevelSnapshot) > 0.5) {
      this.zoomLevelSnapshot = +this.zoomLevel;
    }

    this.render();
  }

  private render = (): void => {

    const bounds = this.map?.getBounds();
    const xBound: [number, number] = [bounds?.getWest() as number, bounds?.getEast() as number];
    const yBound: [number, number] = [bounds?.getNorth() as number, bounds?.getSouth() as number];
    
    this.displayedTreesData = this.treesData.filter(group => this.clusterService.isVisibleElement(group, xBound, yBound)).slice().filter(tree => tree.trees && tree.trees.length > 0);
    
    const emojis = this.graphContainer.select('.emojis-container').selectAll(".emoji").data(this.displayedTreesData);
    
    emojis.exit().remove();

    emojis.enter()
    .append('text').text('🌳').attr('class', 'emoji')
    .merge(emojis as any)
    .style('font-size', this.zoomLevel > 15 ? '20px' : '10px')
    .attr('x', (d, i) => {
      const coordinates = this.project((d as any).geometry.coordinates)
      return coordinates && coordinates.x ? `${coordinates.x}px` : '0px';
    })
    .attr('y', (d, i) => {
      const coordinates = this.project((d as any).geometry.coordinates)
      return coordinates && coordinates.y ? `${coordinates.y}px` : '0px';
    });
  }

  private updateData = (zoomingIn: boolean) => {
    this.treesData = this.clusterService.getClusterData(this.geoJsonData.slice(), this.zoomLevelSnapshot, zoomingIn);
  }

  ngOnDestroy() {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }

}
