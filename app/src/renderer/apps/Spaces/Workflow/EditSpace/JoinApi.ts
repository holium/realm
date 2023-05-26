import {
  CreateSpaceInvitePayload,
  CreateSpaceInviteResponse,
  DeleteAllSpaceInvitesPayload,
  http,
} from '@holium/shared';

class JoinApi {
  private apiBaseUrl: string;

  constructor(apiBaseUrl: string) {
    this.apiBaseUrl = apiBaseUrl;
  }

  private getHeaders() {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    };

    return defaultHeaders;
  }

  createSpaceInvite(payload: CreateSpaceInvitePayload) {
    return http<CreateSpaceInviteResponse>(`${this.apiBaseUrl}/api/invite`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
  }

  deleteAllSpaceInvites(payload: DeleteAllSpaceInvitesPayload) {
    return http<void>(`${this.apiBaseUrl}/api/invite`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
  }
}

export const joinApi = new JoinApi(process.env.JOIN_API_URL as string);
