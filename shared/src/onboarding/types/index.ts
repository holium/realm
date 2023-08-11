export type ThirdEarthProductType =
  | 'planet'
  | 'byop-p'
  | 'byop-nk'
  | 'subscription';

export type ThirdEarthProduct = {
  client_id: number;
  comet_count: string;
  description: string;
  droplet_class_id: number;
  id: number;
  is_migration: boolean;
  is_planet: boolean;
  lang_code: string;
  long_description: string;
  price_id: string;
  priority: number;
  product_status: string;
  product_type: ThirdEarthProductType;
  subscription_price: number;
  threshold: any;
  title: string;
};

export type ThirdEarthShip = {
  ames_port: string;
  code: string;
  created_at: string;
  description: string;
  droplet_id: number;
  droplet_ip: string;
  email: string;
  eth_address: string;
  first_boot: boolean;
  id: number;
  invoice_id: string;
  is_migration: boolean;
  last_restarted: string;
  link: string;
  maintenance_window: number;
  payment_status: string;
  patp: string;
  product_id: number;
  product_type: ThirdEarthProductType;
  screen_name: string;
  ship_status: string;
  ship_type: string;
  sigil: string;
  subscription_id: string;
  subscription_price: number;
  sponsor: string;
  tcp_port: string;
  title: string;
  transaction_id: number;
  updated_at: string;
  user_id: number;
};

export type ThirdEarthPortalSession = {
  bpc: string;
  configuration: string;
  created: number;
  customer: string;
  flow: any;
  id: string;
  livemode: boolean;
  locale: any;
  object: string;
  on_behalf_of: any;
  return_url: string;
  url: string;
};

export type RealmInstallStatus = {
  success: boolean;
  message?: string;
};

type OnboardingAccountPage =
  | '/account'
  | '/account/contact-support'
  | '/account/custom-domain'
  | '/account/download-realm'
  | '/account/get-realm'
  | '/account/storage'
  | '/account/statistics';

type OnboardingSignupPage =
  | '/'
  | '/create-account'
  | '/login'
  | '/verify-email'
  | '/choose-id'
  | '/upload-id'
  | '/upload-id-disclaimer'
  | '/payment'
  | '/booting'
  | '/credentials'
  | '/download';

export type OnboardingPage = OnboardingAccountPage | OnboardingSignupPage;

export type RealmOnboardingStep =
  | '/login'
  | '/add-identity'
  | '/passport'
  | '/hosting'
  | '/intermediary-login'
  | '/choose-id'
  | '/payment'
  | '/booting'
  | '/credentials'
  | '/installation';

export type Nullable<T> = { [P in keyof T]: T[P] | null };
