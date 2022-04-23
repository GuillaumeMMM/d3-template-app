import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapboxD3Component } from './mapbox-d3.component';

describe('MapboxD3Component', () => {
  let component: MapboxD3Component;
  let fixture: ComponentFixture<MapboxD3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MapboxD3Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapboxD3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
