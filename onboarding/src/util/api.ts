import {
  ThirdEarthProduct,
  ThirdEarthPortalSession,
  ThirdEarthShip,
} from '@holium/shared';
import { constants } from './constants';
import { http } from './http';

const defaultHeaders = {
  'Content-Type': 'application/json',
  client_id: constants.API_HEADERS_CLIENT_ID,
  version: constants.API_HEADERS_VERSION,
};

type LoginResponse = {
  token: string;
};

type RegisterResponse = {
  message: string;
};

type VerifyEmailResponse = {
  message: string;
  token: string;
};

type RefreshTokenResponse = {
  token: string;
};

type GetProductsResponse = {
  [key: number]: ThirdEarthProduct;
};

type GetPlanetsResponse = {
  freeProduct: boolean;
  planets: {
    [key: number]: {
      id: number;
      patp: string;
      planet_status: 'available' | 'sold';
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

export type GetUserS3InfoResponse = {
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

type ResetShipCodeResponse = {
  ship_id: string;
  updated_code: string;
};

type UpdateMaintenanceWindowResponse = {
  maintenance_window: string;
};

export const api = {
  login: (email: string, password: string) => {
    return http<LoginResponse>(`${constants.API_URL}/login`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({
        email,
        password,
        keepLogged: true,
      }),
    });
  },
  register: (email: string, password: string) => {
    return http<RegisterResponse>(`${constants.API_URL}/register`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({
        email,
        password,
      }),
    });
  },
  verifyEmail: (verificationcode: string, password?: string) => {
    return http<VerifyEmailResponse>(`${constants.API_URL}/verify-account`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({
        verificationcode,
        /* the account password is needed if confirming an email change,
        otherwise you can leave out or ignore this field */
        password,
      }),
    });
  },
  getProducts: () => {
    return http<GetProductsResponse>(`${constants.API_URL}/products/en`, {
      method: 'GET',
      headers: defaultHeaders,
    });
  },
  getPlanets: (productId: number) => {
    return http<GetPlanetsResponse>(
      `${constants.API_URL}/operator/get-planets-to-sell/${productId}`,
      {
        method: 'GET',
        headers: defaultHeaders,
      }
    );
  },
  stripeMakePayment(
    token: string,
    productId: string,
    patp: string,
    coupon = 'undefined'
  ) {
    return http<StripeMakePaymentResponse>(
      `${constants.API_URL}/stripe-make-payment`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          patp,
          coupon,
        }),
      }
    );
  },
  updatePaymentStatus(token: string, invoiceId: string, paymentStatus: 'OK') {
    return http(`${constants.API_URL}/update-payment-status`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        invoiceId,
        paymentStatus,
      }),
    });
  },
  ship(token: string, patp: string, product: string, invoiceId: string) {
    return http(`${constants.API_URL}/ship`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        patp,
        shipType: 'planet',
        product,
        invoiceId,
      }),
    });
  },
  updatePlanetStatus(
    token: string,
    patp: string,
    planetStatus: 'available' | 'sold'
  ) {
    return http(`${constants.API_URL}/update-planet-status`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        patp,
        planetStatus,
      }),
    });
  },
  getUserShips(token: string) {
    return http<GetUserShipsResponse>(`${constants.API_URL}/get-user-ships`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  getUserResourceHistory(token: string, shipId: string) {
    return http<GetUserNetworkUsageResponse>(
      `${constants.API_URL}/user/resource-history/${shipId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },
  getUserS3Info(token: string, shipId: string) {
    return http<GetUserS3InfoResponse>(
      `${constants.API_URL}/user/s3/${shipId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },
  getManagePaymentLink(token: string) {
    return http<CreateCustomerPortalSessionResponse>(
      `${constants.API_URL}/create-customer-portal-session`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },
  changeEmail(token: string, email: string) {
    return http<ChangeEmailResponse>(`${constants.API_URL}/change-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        version: constants.API_HEADERS_VERSION,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        email,
      }),
    });
  },
  setCustomDomain(
    token: string,
    domain: string,
    dropletId: string,
    dropletIp: string,
    shipId: string,
    userId: string
  ) {
    return http<SetCustomDomainResponse>(`${constants.API_URL}/record-domain`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        domain,
        dropletId,
        dropletIp,
        link: `https://${domain}`,
        shipId,
        userId,
      }),
    });
  },
  resetShipCode(token: string, shipId: string) {
    return http<ResetShipCodeResponse>(
      `${constants.API_URL}/user/reset-code/${shipId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },
  updateMaintenanceWindow(
    token: string,
    shipId: string,
    maintenanceWindow: string
  ) {
    return http<UpdateMaintenanceWindowResponse>(
      `${constants.API_URL}/user/ship/${shipId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          maintenance_window: maintenanceWindow,
        }),
      }
    );
  },
  refreshToken: (token: string) => {
    return http<RefreshTokenResponse>(`${constants.API_URL}/refresh-token`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
