import { Injectable } from '@angular/core';
import { TreeGroup } from '../models/arbre';

@Injectable({
  providedIn: 'root'
})
export class PreferenceService {

  constructor() { 
  }

  public treeEmoji: string = '🌳';

  public circleColor: string = 'rgb(70, 150, 97)';

  public getClusterStats = (cluster: TreeGroup, maxCount: number = 5): {kind: string, count: number}[] => {
    const treeKinds: {kind: string, count: number}[] = [];
    (cluster.trees || []).forEach(tree => {
      const genre: string = tree.properties.genre || 'unknown';
      const matchingKind = treeKinds.find(kind => kind.kind === genre);
      if (matchingKind) {
        matchingKind.count ++;
      } else {
        treeKinds.push({kind: genre, count: 1});
      }
    });

    treeKinds.sort((kindA, kindB) => kindA.count > kindB.count ? -1 : 1);

    const fiveFirst = treeKinds.slice(0, maxCount);
    const other = treeKinds.length > maxCount ? treeKinds.slice(maxCount) : [];
    const otherCount: number = other.reduce((partialSum, current) => current.count + partialSum, 0);
    return fiveFirst.concat(otherCount ? {kind: 'Other', count: otherCount} : []);
  }
}
