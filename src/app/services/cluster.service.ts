import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { FeatureTree, TreeGroup } from '../models/arbre';

@Injectable({
  providedIn: 'root'
})
export class ClusterService {

  constructor() { 
  }

  private ratioScale = d3.scaleLinear().domain([7, 14.5]).range([0.05, 0.001]);
  private treeGroupsSnapshot: TreeGroup[] = [];

  public getClusterData = (trees: FeatureTree[], zoom: number = 10, zoomingIn: boolean = false): TreeGroup[] => {
    let treeGroups: TreeGroup[] = [];

    if (zoomingIn && this.treeGroupsSnapshot) {
      treeGroups = this.treeGroupsSnapshot.map(group => {
        return {...group, trees: []}
      });
    }

    treeGroups[0] = {
      geometry: trees[0].geometry,
      trees: [trees[0]]
    }

    const ratio = this.getRatioForZoom(zoom);

    for (let i = 1; i < trees.length; i++) {
      //  0.002 is the ratio for which all trees will be displayed
      const matchingGroup: TreeGroup | undefined = ratio > 0.002 ? treeGroups.find(treeGroup => {
        return this.euclidianDistance(treeGroup.geometry.coordinates, trees[i].geometry.coordinates) < ratio
      }) : undefined;

      if (matchingGroup) {
        matchingGroup.trees.push(trees[i]);
      } else {
        treeGroups.push({
          geometry: trees[i].geometry,
          trees: [trees[i]]
        });
      }
    }

    /* treeGroups = this.computeGroupCeters(treeGroups); */
    this.treeGroupsSnapshot = treeGroups;
    return treeGroups;
  }

  private euclidianDistance = (pointA: number[], pointB: number[]): number => {
    return Math.sqrt(Math.pow(pointB[0] - pointA[0], 2) + Math.pow(pointB[1] - pointA[1], 2));
  }
  
  public isVisibleElement = (group: TreeGroup, xBound: [number, number], yBound: [number, number]): boolean => {
    return group.geometry.coordinates[0] >= xBound[0] && group.geometry.coordinates[0] <= xBound[1]
      && group.geometry.coordinates[1] <= yBound[0] && group.geometry.coordinates[1] >= yBound[1];
  }

  private getRatioForZoom = (zoom: number): number => {
    return this.ratioScale(zoom);
  }

  /* private computeGroupCeters = (groups: TreeGroup[]): TreeGroup[] => {
    return groups.map(group => {
      return {
        ...group,
        geometry: {
          ...group.geometry,
          coordinates: this.averageGeolocation(group.trees.map(tree => tree.geometry.coordinates) as [number, number][])}
      }
    })
  } */

  /* private averageGeolocation = (coords: [number, number][]) => {
    let x = 0.0;
    let y = 0.0;
    let z = 0.0;
  
    for (let coord of coords) {
      let latitude = coord[0] * Math.PI / 180;
      let longitude = coord[1] * Math.PI / 180;
  
      x += Math.cos(latitude) * Math.cos(longitude);
      y += Math.cos(latitude) * Math.sin(longitude);
      z += Math.sin(latitude);
    }
  
    let total = coords.length;
  
    x = x / total;
    y = y / total;
    z = z / total;
  
    let centralLongitude = Math.atan2(y, x);
    let centralSquareRoot = Math.sqrt(x * x + y * y);
    let centralLatitude = Math.atan2(z, centralSquareRoot);
  
    return [centralLatitude * 180 / Math.PI, centralLongitude * 180 / Math.PI];
  } */
}
