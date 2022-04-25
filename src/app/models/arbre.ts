import { Feature, GeometryObject, Point } from 'geojson';

export class TreeProperties {
    adresse: string = '';
    arrondissement: string = '';
    circonferenceencm: number = 0;
    complementadresse: string = '';
    dateplantation: string = '';
    domanialite: string = '';
    espece: string = '';
    genre: string = '';
    geo_point_2d: number[] = [0, 0];
    hauteurenm: number = 0;
    idbase: string = '';
    libellefrancais: string = '';
}

export interface FeatureTree extends Feature {
    properties: TreeProperties;
    geometry: Point;
}

export interface TreeGroup {
    geometry: Point;
    trees: FeatureTree[];
}