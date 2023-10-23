import {
  ThirdEarthPortalSession,
  ThirdEarthProduct,
  ThirdEarthShip,
} from '@holium/shared';

import { ThirdEarthAlert } from '../types';
import { http } from './http';

type LoginResponse = {
  token: string;
  email: string;
  client_side_encryption_key: string;
  message?: string;
};

type RegisterResponse = {
  message?: string;
};

type VerifyEmailResponse = {
  message: string;
  token: string;
};

type RefreshTokenResponse = {
  email: string;
  token: string;
};

type GetProductsResponse = ThirdEarthProduct[];

type ResetPasswordResponse = {
  message: string;
  token?: string;
  email?: string;
  client_side_encryption_key?: string;
};

type GetPlanetsResponse = {
  freeProduct: boolean;
  planets: {
    [key: number]: {
      id: number;
      patp: string;
      sigil: string;
    };
  };
};

type GetUserShipsResponse = ThirdEarthShip[];

type GetUserNetworkUsageResponse = {
  networkUsage?: {
    minio_sent_total: number | null;
    network_sent_total: number | null;
    received_total: number | null;
    ship_id: number;
    total_sent: number | null;
  };
};

type GetUserS3InfoResponse = {
  code: string;
  consoleUrl: string;
  storageCapacity: number;
  storageUsed: string;
  userName: string;
};

type CreateCustomerPortalSessionResponse = ThirdEarthPortalSession;

type StripeMakePaymentResponse = {
  clientSecret: string;
  invoiceId: string;
  paymentMethods: {
    data: any[];
  };
  subscriptionId: string;
};

type SetCustomDomainResponse = {
  checkIp: string;
  message: string;
};

type ChangeEmailResponse = {
  message: string;
  email?: string;
};

type ChangePasswordResponse = {
  message: string;
  token?: string;
  email?: string;
};

type ResetShipCodeResponse = {
  ship_id: string;
  updated_code: string;
};

type UpdateMaintenanceWindowResponse = {
  maintenance_window: string;
};

type EjectShipResponse = {
  message: string;
};

type UpdatePaymentResponse = {
  msg?: string;
};

type UpdatePlanetResponse = {
  msg?: string;
};

type ProvisionalShipEntryPayload = {
  token: string;
  product: string;
  invoiceId: string;
  shipType: string;
  patp?: string;
};

type ProvisionalShipEntryResponse = {
  id: number;
  user_id: number;
  invoice_id: string;
}[];

type PrepareSftpServerForPierUploadResponse = {
  patp?: string;
  sigil?: string;
  arvo_key_file?: {
    iv: string;
    content: string;
  };
  sponsor?: string;
  planet_status?: string;
  product_ids?: number[];
};

type AlertsResponse = {
  alerts: ThirdEarthAlert[];
};

export class ThirdEarthApi {
  private apiBaseUrl: string;
  private headersClientId: string;
  private headersVersion: string;

  constructor(
    apiBaseUrl: string,
    headersClientId: string,
    headersVersion: string
  ) {
    this.apiBaseUrl = apiBaseUrl;
    this.headersClientId = headersClientId;
    this.headersVersion = headersVersion;
  }

  private getHeaders(token?: string) {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      client_id: this.headersClientId,
      version: this.headersVersion,
    };

    if (!token) {
      return defaultHeaders;
    } else {
      return {
        ...defaultHeaders,
        Authorization: `Bearer ${token}`,
      };
    }
  }

  login(
    email: string,
    password: string,
    reveal_realm_key = false,
    keepLogged = true
  ) {
    return http<LoginResponse>(`${this.apiBaseUrl}/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        email,
        password,
        reveal_realm_key,
        keepLogged,
      }),
    });
  }

  register(email: string, password: string) {
    return http<RegisterResponse>(`${this.apiBaseUrl}/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        email,
        password,
      }),
    });
  }

  verifyEmail(verificationcode: string, password?: string) {
    return http<VerifyEmailResponse>(`${this.apiBaseUrl}/verify-account`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        verificationcode,
        /* The account password is needed if confirming an email change,
        otherwise it can be left out. */
        password,
      }),
    });
  }

  resetPassword(
    verificationcode: string,
    newPassword: string,
    reveal_realm_key?: boolean
  ) {
    return http<ResetPasswordResponse>(`${this.apiBaseUrl}/reset-password`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        verificationcode,
        newPassword,
        reveal_realm_key,
      }),
    });
  }

  forgotPassword(email: string, realm_invite = false) {
    return http<ResetPasswordResponse>(`${this.apiBaseUrl}/forgot-password`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        email,
        realm_invite,
      }),
    });
  }

  getProducts() {
    return http<GetProductsResponse>(`${this.apiBaseUrl}/products/en`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
  }

  getPlanets(productId: number) {
    return http<GetPlanetsResponse>(
      `${this.apiBaseUrl}/operator/get-planets-to-sell/${productId}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );
  }

  stripeMakePayment(
    token: string,
    productId: string,
    priceId: string,
    patp?: string
  ) {
    return http<StripeMakePaymentResponse>(
      `${this.apiBaseUrl}/stripe-make-payment`,
      {
        method: 'POST',
        headers: this.getHeaders(token),
        body: JSON.stringify({
          productId,
          priceId,
          patp,
        }),
      }
    );
  }

  updatePaymentStatus(token: string, invoiceId: string, paymentStatus: 'OK') {
    return http<UpdatePaymentResponse>(
      `${this.apiBaseUrl}/update-payment-status`,
      {
        method: 'PUT',
        headers: this.getHeaders(token),
        body: JSON.stringify({
          invoiceId,
          paymentStatus,
        }),
      }
    );
  }

  provisionalShipEntry({
    token,
    patp,
    shipType,
    product,
    invoiceId,
  }: ProvisionalShipEntryPayload) {
    return http<ProvisionalShipEntryResponse>(
      `${this.apiBaseUrl}/provisional-ship-entry`,
      {
        method: 'POST',
        headers: this.getHeaders(token),
        body: JSON.stringify({
          patp,
          shipType,
          invoiceId,
          product,
        }),
      }
    );
  }

  updatePlanetStatus(
    token: string,
    patp: string,
    planetStatus: 'available' | 'sold'
  ) {
    return http<UpdatePlanetResponse>(
      `${this.apiBaseUrl}/update-planet-status`,
      {
        method: 'PUT',
        headers: this.getHeaders(token),
        body: JSON.stringify({
          patp,
          planetStatus,
        }),
      }
    );
  }

  getUserShips(token: string) {
    return http<GetUserShipsResponse>(`${this.apiBaseUrl}/get-user-ships`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
  }

  getUserResourceHistory(token: string, shipId: string) {
    return http<GetUserNetworkUsageResponse>(
      `${this.apiBaseUrl}/user/resource-history/${shipId}`,
      {
        method: 'GET',
        headers: this.getHeaders(token),
      }
    );
  }

  getUserStorageInfo(token: string, shipId: string) {
    return http<GetUserS3InfoResponse>(`${this.apiBaseUrl}/user/s3/${shipId}`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
  }

  setStorage(token: string, shipId: string) {
    return http<string>(`${this.apiBaseUrl}/user/setup-storage`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({
        shipId,
      }),
    });
  }

  getManagePaymentLink(token: string) {
    return http<CreateCustomerPortalSessionResponse>(
      `${this.apiBaseUrl}/create-customer-portal-session`,
      {
        method: 'POST',
        headers: this.getHeaders(token),
      }
    );
  }

  changeEmail(token: string, email: string) {
    return http<ChangeEmailResponse>(`${this.apiBaseUrl}/change-email`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({
        email,
      }),
    });
  }

  changePassword(token: string, password: string) {
    return http<ChangePasswordResponse>(`${this.apiBaseUrl}/change-password`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({
        password,
      }),
    });
  }

  setCustomDomain(
    token: string,
    domain: string,
    dropletId: string,
    dropletIp: string,
    shipId: string,
    userId: string
  ) {
    return http<SetCustomDomainResponse>(`${this.apiBaseUrl}/record-domain`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({
        domain,
        dropletId,
        dropletIp,
        link: `https://${domain}`,
        shipId,
        userId,
      }),
    });
  }

  resetShipCode(token: string, shipId: string) {
    return http<ResetShipCodeResponse>(
      `${this.apiBaseUrl}/user/reset-code/${shipId}`,
      {
        method: 'PUT',
        headers: this.getHeaders(token),
      }
    );
  }

  updateMaintenanceWindow(
    token: string,
    shipId: string,
    maintenanceWindow: string
  ) {
    return http<UpdateMaintenanceWindowResponse>(
      `${this.apiBaseUrl}/user/update-maintenance-window/${shipId}`,
      {
        method: 'PUT',
        headers: this.getHeaders(token),
        body: JSON.stringify({
          maintenance_window: maintenanceWindow,
        }),
      }
    );
  }

  ejectShip(
    token: string,
    shipId: string,
    ejectAddress: string,
    ethAddress: string
  ) {
    return http<EjectShipResponse>(`${this.apiBaseUrl}/send-eject-id-email`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({
        shipId,
        ejectAddress,
        ethAddress,
      }),
    });
  }

  refreshToken(token: string) {
    return http<RefreshTokenResponse>(`${this.apiBaseUrl}/refresh-token`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
  }

  prepareSftpServerForPierUpload(token: string, userId: string) {
    const formData = new FormData();
    formData.append('type', 'sftp');
    formData.append('desks', 'false');
    formData.append('groups', 'false');

    return http<PrepareSftpServerForPierUploadResponse>(
      `${this.apiBaseUrl}/user/host-ship/${userId}`,
      {
        method: 'POST',
        headers: {
          // Don't specify content-type for FormData.
          authorization: `Bearer ${token}`,
          client_id: this.headersClientId,
          version: this.headersVersion,
        },
        body: formData,
      }
    );
  }

  log(
    token: string,
    payload: {
      file: string;
      type: string;
      subject: string;
      message: string;
      productId?: string;
      auditTrailCode?: number;
    }
  ) {
    return http(`${this.apiBaseUrl}/user/raise-alarm`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ ...payload }),
    });
  }

  alerts() {
    return http<AlertsResponse>(`${this.apiBaseUrl}/alerts`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
  }
}
