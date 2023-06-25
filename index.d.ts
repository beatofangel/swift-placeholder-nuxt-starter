export interface Session extends Record<string, any> {
  declare id: string
  declare name: string
  declare type: string
  declare businessCategory: string
  declare templates: string[]
}

export enum EditMode {
  Create = 1, Read = 2, Update = 3, Delete = 4
}

export interface CommonListItem {
  id: string,
  name: string,
  icon?: string,
  ordinal: number,
  isEdit: boolean,
  sort: boolean,
}

export interface Link {
  name: string,
  path: string,
  icon: string,
  index: number,
}

export interface Setting {
  id: string,
  name: string,
  description: string,
  type: string,
  value: string | number | boolean
}
