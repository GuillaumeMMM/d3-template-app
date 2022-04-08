import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WindowService {

  constructor() { }

  public windowResize$: Subject<[number, number]> = new Subject;
}
