import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { FeatureTree, TreeGroup } from '../models/arbre';

@Injectable({
  providedIn: 'root'
})
export class ClusterService {

  constructor() { 
  }

  private ratioScale = d3.scaleLinear().domain([6, 13.5]).range([0.1, 0.001]);
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
}
