export interface RegionItem {
  id?: number | string;
  name?: string;
  countryName?: string;
  iso2?: string;
  countryCode?: string;
  code?: string;
  description?: string;
  [key: string]: any;
}

export interface RegionsData {
  countries?: RegionItem[];
  governorates?: RegionItem[];
  districts?: RegionItem[];
  [key: string]: any;
}

export interface CitiesResponse {
  cities?: Cities[];
  [key: string]: any;
}

export interface Cities {
  id?: number | string;
  name?: string;
  [key: string]: any;
}
