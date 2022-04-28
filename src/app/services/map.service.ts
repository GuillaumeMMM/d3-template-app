import { Injectable } from '@angular/core';
import mapboxgl, { Map } from 'mapbox-gl';
import { TreeGroup } from '../models/arbre';
import * as d3 from 'd3';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  constructor() { }

  public renderD3Trees = (map: Map | undefined, container: d3.Selection<any, unknown, null, undefined>, data: TreeGroup[], zoomLevel: number) => {
    const treesData = data.filter(tree => tree.trees && tree.trees.length === 1);
    const trees = container.select('.trees-container').selectAll(".tree").data(treesData);
    
    this.renderTrees(trees, zoomLevel, map);
    this.renderClusters(container, map, data.filter(tree => tree.trees && tree.trees.length > 1));
  }

  private renderTrees = (treesContainer: d3.Selection<any, any, any, any>, zoomLevel: number, map: Map | undefined) => {
    treesContainer.exit().remove();

    treesContainer.enter()
    .append('text').text('🌳').attr('class', 'tree')
    .merge(treesContainer as any)
    .style('font-size', '10px')
    .attr('x', (d, i) => {
      return this.getXPosition(d, map);
    })
    .attr('y', (d, i) => {
      return this.getYPosition(d, map);
    });
  }

  private renderClusters = (clustersContainer: d3.Selection<any, any, any, any>, map: Map | undefined, data: TreeGroup[]) => {
    const clusters = clustersContainer.select('.clusters-container').selectAll(".cluster").data(data);

    clusters.exit().remove();

    clusters.attr("transform", d => `translate(${this.getXPosition(d, map)}, ${this.getYPosition(d, map)})`)
    .style('font-size', d => this.getCircleRadius(d, 2));

    clusters.select('.cluster-circle-3').attr('r', d => this.getCircleRadius(d, 3))
    clusters.select('.cluster-circle-2').attr('r', d => this.getCircleRadius(d, 2))
    clusters.select('.cluster-circle-1').attr('r', d => this.getCircleRadius(d, 1))
    
    const clusterGroup = clusters.enter().append('g')
      .attr('class', 'cluster')
      .attr("transform", d => `translate(${this.getXPosition(d, map)}, ${this.getYPosition(d, map)})`)
      .style('font-size', d => this.getCircleRadius(d, 2));

      clusterGroup.append('circle').attr('class', 'cluster-circle-3').attr('cx', 0).attr('cy', 0)
      .attr('r', d => this.getCircleRadius(d, 3))
      .attr('opacity', 0.1)
      .attr('fill', 'rgb(221, 32, 212)');

      clusterGroup.append('circle').attr('class', 'cluster-circle-2').attr('cx', 0).attr('cy', 0)
      .attr('r', d => this.getCircleRadius(d, 2))
      .attr('opacity', 0.2)
      .attr('fill', 'rgb(221, 32, 212)');

      clusterGroup.append('circle').attr('class', 'cluster-circle-1').attr('cx', 0).attr('cy', 0)
      .attr('r', d => this.getCircleRadius(d, 1))
      .attr('opacity', 0.3)
      .attr('fill', 'rgb(221, 32, 212)');

      clusterGroup.append('text').text(/* '🌳' */'💖').attr('text-anchor', 'middle').attr('alignment-baseline', 'central');
  }

  private getXPosition = (d: any, map: Map | undefined) => {
    const coordinates = this.project((d as any).geometry.coordinates, map)
    return coordinates && coordinates.x ? `${coordinates.x}` : '0';
  }

  private getYPosition = (d: any, map: Map | undefined) => {
    const coordinates = this.project((d as any).geometry.coordinates, map)
      return coordinates && coordinates.y ? `${coordinates.y}` : '0';
  }

  private getCircleRadius = (d: TreeGroup, level: 1 | 2 | 3) => {
    const minRadius: number = 8;
    let ratio: number = 1;
    switch (level) {
      case 1: { ratio = 1; break; }
      case 2: { ratio = 1.5; break; }
      case 3: { ratio = 2; break; }
    }
    return `${Math.max(ratio * minRadius, ratio * Math.sqrt(d.trees.length))}px`;
  }

  private project = (d: number[], map: Map | undefined) => {
    return map?.project(new mapboxgl.LngLat(d[0], d[1]));
  }
}
