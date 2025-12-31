import type { PromptTag } from './storage'

export type MessageType = 'PING' | 'OPEN_WINDOW' | 'STREAM_CHUNK' | 'STREAM_END' | 'ERROR'

export interface BaseMessage {
  action: MessageType
}

export interface PingMessage extends BaseMessage {
  action: 'PING'
}

export interface OpenWindowMessage extends BaseMessage {
  action: 'OPEN_WINDOW'
  windowType: PromptTag
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

export type AppMessage =
  | PingMessage
  | OpenWindowMessage
  | StreamChunkMessage
  | StreamEndMessage
  | ErrorMessage
