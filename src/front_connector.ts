import * as jwt from 'jsonwebtoken';
import * as moment from 'moment';
import { frontId, frontSecret, frontUrl, randomString } from './server';
import needle from 'needle';

export enum InitialStatus {
  Queued = 'queued',
  Ringing = 'ringing'
}

export enum CallStatus {
  Queued = 'queued',
  Ringing = 'ringing',
  Connected = 'connected',
  Hold = 'hold',
  Hangup = 'hangup',
  Abandoned = 'abandoned',
  Missed = 'missed',
  Transferred = 'transferred'
}

export enum Direction {
  Inbound = 'inbound',
  Outbound = 'outbound'
}

export enum SpeakerType {
  Internal = 'internal',
  External = 'external'
}

export enum RecordingType {
  Call = 'call',
  Voicemail = 'voicemail'
}

export interface ExternalCaller {
  name?: string;
  handle: string;
}

export interface Transcript {
  speaker_name: string;
  content: string;
  start_time_seconds: number;
  speaker_type: SpeakerType;
}

export interface CreateCallPayload {
  external_call_id: string;
  initial_status: InitialStatus;
  direction: Direction;
  to?: ExternalCaller;
  from?: ExternalCaller;
  started_at?: number;
  parent_external_call_id: string;
  agent_email_address?: string;
}

export interface UpdateCallPayload {
  occurred_at?: number;
  call_status: string;
  agent_email_address?: string;
}

export interface AddCallSummaryPayload {
  content: string;
}

export interface AddCallTranscriptPayload {
  lines: Transcript[];
}

export interface AddCallRecordingPayload {
  attachments: File;
  recording_type: RecordingType;
}

export class FrontConnector {
  static async createCall(channelId: string, payload: CreateCallPayload) {
    const endpoint = `${frontUrl}/channels/${channelId}/calls`;
    return this.makeChannelAPIRequest('post', channelId, endpoint, payload);
  }

  static async updateCall(channelId: string, externalCallId: string, payload: UpdateCallPayload) {
    const endpoint = `${frontUrl}/channels/${channelId}/calls/${externalCallId}`;
    return this.makeChannelAPIRequest('patch', channelId, endpoint, payload);
  }

  static async addCallSummary(channelId: string, externalCallId: string, payload: AddCallSummaryPayload) {
    const endpoint = `${frontUrl}/channels/${channelId}/calls/${externalCallId}/summary`;
    return this.makeChannelAPIRequest('post', channelId, endpoint, payload);
  }

  static async addCallTranscript(channelId: string, externalCallId: string, payload: AddCallTranscriptPayload) {
    const endpoint = `${frontUrl}/channels/${channelId}/calls/${externalCallId}/transcript`;
    return this.makeChannelAPIRequest('post', channelId, endpoint, payload);
  }

  static async addCallRecording(channelId: string, externalCallId: string, payload: AddCallRecordingPayload) {
    const endpoint = `${frontUrl}/channels/${channelId}/calls/${externalCallId}/recording`;
    return this.makeChannelAPIRequest('post', channelId, endpoint, payload, true);
  }

  private static async makeChannelAPIRequest(method: string, channelId: string, path: string, payload: CreateCallPayload | UpdateCallPayload | AddCallSummaryPayload | AddCallTranscriptPayload | AddCallRecordingPayload, isMultipart = false) {
    const options = { headers: this.buildHeaders(channelId, isMultipart), multipart: isMultipart };
    return await needle(method as 'post' | 'patch', path, payload, options);
  }

  private static buildHeaders(channelId: string, hasAttachments?: boolean) {
    const frontToken = this.buildToken(channelId);
    return {
      Authorization: `Bearer ${frontToken}`,
      'Content-Type': hasAttachments ? 'multipart/form-data' : 'application/json',
    };
  }

  static buildToken(channelId: string) {
    const signature = frontSecret;
    const exp = moment.utc(Date.now()).add('10', 'seconds').unix();
    const payload = {
      iss: frontId,
      jti: randomString(8),
      sub: channelId,
      exp
    };

    return jwt.sign(payload, signature);
  }
}
