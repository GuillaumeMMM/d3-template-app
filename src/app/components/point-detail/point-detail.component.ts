import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { TreeGroup, TreeProperties } from 'src/app/models/arbre';
import { PreferenceService } from 'src/app/services/preference.service';

@Component({
  selector: 'app-point-detail',
  templateUrl: './point-detail.component.html',
  styleUrls: ['./point-detail.component.scss']
})
export class PointDetailComponent implements OnChanges {

  constructor(public preferenceService: PreferenceService) { }

  @Input() cluster: TreeGroup | null = null;

  public treeKinds: {kind: string, count: number}[] = [];
  public treeProperties: (keyof TreeProperties)[] = ['genre', 'libellefrancais', 'dateplantation'];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['cluster'] && changes['cluster']['currentValue'] && this.cluster) {
      this.treeKinds = this.preferenceService.getClusterStats(this.cluster, 5);
    }
  }

}
