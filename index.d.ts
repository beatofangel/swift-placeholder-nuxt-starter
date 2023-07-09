// export interface Session extends Record<string, any> {
//   declare id: string
//   declare name: string
//   declare type: string
//   declare businessCategory: string
//   declare templates: string[]
// }
import type { Session } from 'next-auth';
export interface SessionWrapper extends Session {
  uid: string
  username: string
}

export interface WorkData extends Replacement {
  id: string
  name: string
}

export interface Replacement extends Record<string, any> {
  businessCategory: string
  templates: Template[]
}

export interface Template extends Record<string, any> {
  id: string
  name: string
  path: string
  placeholders: Placeholder[]
}

export interface Placeholder extends Record<string, any> {
  id: string
  name: string
  type: PlaceholderType
  format?: string
  value?: any
}

// export enum EditMode {
//   Create = 1, Read = 2, Update = 3, Delete = 4
// }

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

export enum WsType {
  REPLACEMENT = 1
}

export type HTTPMethod = "GET" | "HEAD" | "PATCH" | "POST" | "PUT" | "DELETE" | "CONNECT" | "OPTIONS" | "TRACE" | string

export enum PlaceholderType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date'
}

// export enum FileType {
//   word = "word",
//   cell = "cell",
//   slide = "slide"
// }
