import type { PromptKeys } from './storage'

export type MessageType =
  | 'PING'
  | 'OPEN_WINDOW'
  | 'STREAM_CHUNK'
  | 'STREAM_END'
  | 'ERROR'
  | 'GET_SELECTION'

export interface BaseMessage {
  action: MessageType
}

export interface PingMessage extends BaseMessage {
  action: 'PING'
}

export interface OpenWindowMessage extends BaseMessage {
  action: 'OPEN_WINDOW'
  windowType: PromptKeys
}

export interface StreamChunkMessage extends BaseMessage {
  action: 'STREAM_CHUNK'
  content: string
}

export interface StreamEndMessage extends BaseMessage {
  action: 'STREAM_END'
}

export interface ErrorMessage extends BaseMessage {
  action: 'ERROR'
  message: string
}

export interface GetSelectionMessage extends BaseMessage {
  action: 'GET_SELECTION'
}

export type AppMessage =
  | PingMessage
  | OpenWindowMessage
  | StreamChunkMessage
  | StreamEndMessage
  | ErrorMessage
  | GetSelectionMessage
