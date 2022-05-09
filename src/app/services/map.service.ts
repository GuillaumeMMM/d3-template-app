import { Injectable } from '@angular/core';
import mapboxgl, { Map } from 'mapbox-gl';
import { TreeGroup } from '../models/arbre';
import * as d3 from 'd3';
import { MapInfoService } from './map-info.service';
import { PreferenceService } from './preference.service';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  constructor(private mapInfoService: MapInfoService, private preferenceService: PreferenceService) { }

  public renderD3Trees = (map: Map | undefined, container: d3.Selection<any, unknown, null, undefined>, data: TreeGroup[]) => {
    this.renderClusters(container, map, data.filter(tree => tree.trees));
    this.renderClusters(container, map, data.filter(tree => tree.trees));
  }

  private renderClusters = (clustersContainer: d3.Selection<any, any, any, any>, map: Map | undefined, data: TreeGroup[]) => {

    const clusters = clustersContainer.select('.clusters-container').selectAll(".cluster").data(data);

    clusters.exit().remove();

    clusters.attr("transform", d => `translate(${this.getXPosition(d, map)}, ${this.getYPosition(d, map)})`)
      .style('font-size', d => this.getCircleRadius(d, 2));

    clusters.select('.cluster-circle-3')
      .attr('r', d => this.getCircleRadius(d, 3))
      .attr('opacity', d => d.trees.length > 1 ? 0.18 : 0)
    clusters.select('.cluster-circle-2')
      .attr('r', d => this.getCircleRadius(d, 2))
      .attr('opacity', d => d.trees.length > 1 ? 0.18 : 0)
    clusters.select('.cluster-circle-1')
      .attr('r', d => this.getCircleRadius(d, 1))
      .attr('opacity', d => d.trees.length > 1 ? 0.18 : 0)
    clusters.select('.outline-circle').attr('r', d => this.getCircleRadius(d, d.trees.length > 1 ? 3 : 2))

    const clusterGroup = clusters.enter().append('g')
      .attr('class', 'cluster')
      .attr("transform", d => `translate(${this.getXPosition(d, map)}, ${this.getYPosition(d, map)})`)
      .style('font-size', d => this.getCircleRadius(d, 2));

    clusterGroup.append('circle').attr('class', 'cluster-circle-3').attr('cx', 0).attr('cy', 0)
      .attr('r', d => this.getCircleRadius(d, 3))
      .attr('opacity', d => d.trees.length > 1 ? 0.1 : 0)
      .attr('fill', this.preferenceService.circleColor);

    clusterGroup.append('circle').attr('class', 'cluster-circle-2').attr('cx', 0).attr('cy', 0)
      .attr('r', d => this.getCircleRadius(d, 2))
      .attr('opacity', d => d.trees.length > 1 ? 0.2 : 0)
      .attr('fill', this.preferenceService.circleColor);

    clusterGroup.append('circle').attr('class', 'cluster-circle-1').attr('cx', 0).attr('cy', 0)
      .attr('r', d => this.getCircleRadius(d, 1))
      .attr('opacity', d => d.trees.length > 1 ? 0.3 : 0)
      .attr('fill', this.preferenceService.circleColor);

    clusterGroup.append('circle').attr('class', 'outline-circle').attr('cx', 0).attr('cy', 0)
      .attr('r', d => this.getCircleRadius(d, d.trees.length > 1 ? 3 : 2))
      .attr('opacity', 0)
      .attr('fill', 'none').attr('stroke', 'white').attr('stroke-width', '2px');

    clusterGroup.append('text').text(this.preferenceService.treeEmoji).attr('text-anchor', 'middle').attr('alignment-baseline', 'central');

    const mapInfoService = this.mapInfoService;

    clusterGroup.on('mouseover', function (e, d) {
      mapInfoService.hoverCluster$.next(d);
      d3.select(this).select('.outline-circle').attr('opacity', 1);
    });

    clusterGroup.on('mouseout', function (e, d) {
      mapInfoService.hoverCluster$.next(null);
      d3.select(this).select('.outline-circle').attr('opacity', 0);
    });
  }

  private getXPosition = (d: any, map: Map | undefined) => {
    const coordinates = this.project((d as any).geometry.coordinates, map)
    return coordinates && coordinates.x ? `${coordinates.x}` : '0';
  }

  private getYPosition = (d: any, map: Map | undefined) => {
    const coordinates = this.project((d as any).geometry.coordinates, map)
    return coordinates && coordinates.y ? `${coordinates.y}` : '0';
  }

  private getCircleRadius = (d: TreeGroup, level: 1 | 2 | 3) => {
    const minRadius: number = 8;
    let ratio: number = 1;
    switch (level) {
      case 1: { ratio = 1; break; }
      case 2: { ratio = 1.5; break; }
      case 3: { ratio = 2; break; }
    }
    return `${Math.max(ratio * minRadius, 0.2 * ratio * Math.sqrt(d.trees.length * 30))}px`;
  }

  private project = (d: number[], map: Map | undefined) => {
    return map?.project(new mapboxgl.LngLat(d[0], d[1]));
  }
}
