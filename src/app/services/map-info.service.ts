import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { TreeGroup } from '../models/arbre';

@Injectable({
  providedIn: 'root'
})
export class MapInfoService {

  constructor() { }

  public hoverCluster$: Subject<TreeGroup | null> = new Subject;
}
