import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-point-detail',
  templateUrl: './point-detail.component.html',
  styleUrls: ['./point-detail.component.scss']
})
export class PointDetailComponent implements OnInit {

  constructor() { }

  @Input() text: string = '';

  ngOnInit(): void {
  }

}
