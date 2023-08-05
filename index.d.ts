// export interface Session extends Record<string, any> {
//   declare id: string
//   declare name: string
//   declare type: string
//   declare businessCategory: string
//   declare templates: string[]
// }
import type { Session } from 'next-auth';
import type { QueueObject } from 'async-es'
export interface SessionWrapper extends Session {
  uid: string
  username: string
}

export interface WorkData extends Replacement {
  id: string
  name: string
  type: string
}

export interface Replacement extends Record<string, any> {
  businessCategory: string
  templates: Template[]
}

export interface Template extends Record<string, any> {
  id: string | undefined
  name: string | undefined
  path: string | undefined
  placeholders: Placeholder[]
}

export interface Placeholder extends Record<string, any> {
  id: string
  name: string
  type: PlaceholderType
  format?: string
  value?: any
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
export interface PlaceholderStatistic {
  id: string,
  count: number
}

type ContentControl = {
  InternalId: number,
  Tag: string,
  Id: number,
  Lock?: number,
  PlaceHolderText?: string,
}
export type ValidatePlaceholdersResult = {
  warning: boolean,
  distinctContentControls: {
    Tag: string,
    contentControls: ContentControl[]
  }[],
  valid?: {
    placeholders?: placeholders[],
  },
  invalid?: {
    placeholders?: Placeholder[],
    contentControls?: ContentControl[]
  }
}

export type DocWarning = { text?: string[], title?: string, ignore?: boolean }

export type Connector = { executeMethod: (arg0: string, arg1: [any] | null, arg2?: Function) => void, callCommand: () => void }

export type Asc = { scope: Record<string, any> }

declare global {
  interface Window {
    connector: Ref<Connector>;
    Asc: Ref<Asc>;
    docQueue: Ref<QueueObject<T>>
  }
}
