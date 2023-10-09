import { ChooseIdServerSideProps } from '../../hosting-holium-com/src/pages/choose-id';
import getUserShipsFixture from '../fixtures/get-user-ships.json';
import provisionalShipEntryFixture from '../fixtures/provisional-ship-entry.json';
import raiseAlarmFixture from '../fixtures/raise-alarm.json';
import refreshTokenFixture from '../fixtures/refresh-token.json';
import registerFixture from '../fixtures/register.json';
import stripeMakePaymentFixture from '../fixtures/stripe-make-payment.json';
import verifyAccountFixture from '../fixtures/verify-account.json';

import 'cypress-plugin-stripe-elements';

const API_BASE_URL = Cypress.env('API_URL');

describe('hosting.holium.com', () => {
  beforeEach(() => {
    // Always intercept /refresh-token
    cy.intercept('GET', `${API_BASE_URL}/refresh-token`, {
      statusCode: 200,
      body: refreshTokenFixture,
    }).as('refreshToken');

    // We can't intercept GET '/products/en' and '/operator/get-planets-to-sell/*
    // since they're server-side. But we can stub the client page request and alter the response
    cy.intercept('GET', '**/choose-id.json', (req) => {
      req.reply((res) => {
        const mockedPageProps: ChooseIdServerSideProps = {
          identities: ['~dislet-polfed', '~lopbud-forfyl'],
          back_url: '',
        };
        res.body.pageProps = mockedPageProps;
      });
    }).as('getProducts');

    // Intercept Stripe API calls
    cy.intercept('GET', 'https://js.stripe.com/v3/.deploy_status_henson.json', {
      statusCode: 200,
      body: {},
    }).as('stripeJs');
    cy.intercept('GET', 'https://js.stripe.com/v3/fingerprinted/data/*', {
      statusCode: 200,
      body: {},
    }).as('stripeJs');
    cy.intercept(
      'GET',
      'https://merchant-ui-api.stripe.com/elements/sessions*',
      {
        statusCode: 200,
        body: {},
      }
    ).as('stripeElements');
    cy.intercept('GET', 'https://api.stripe.com/v1/elements/sessions*', {
      statusCode: 200,
      body: {},
    }).as('stripeElements');
    cy.intercept('POST', 'https://r.stripe.com/0', {
      statusCode: 200,
      body: {},
    }).as('stripeJs-0');
    cy.intercept('POST', 'https://r.stripe.com/6', {
      statusCode: 200,
      body: {},
    }).as('stripeJs-6');
    cy.intercept('POST', 'https://api.stripe.com/v1/payment_methods', {
      statusCode: 200,
      body: {},
    }).as('createPaymentMethod');
    cy.intercept(
      'POST',
      'https://api.stripe.com/v1/payment_intents/*/confirm',
      {
        body: {
          // stripe client requires `error` to be present for both success and failed response
          error: false,
          status: 'succeeded',
        },
      }
    ).as('confirmPayment');
    cy.intercept('POST', 'https://m.stripe.com/6', {
      statusCode: 200,
      body: {},
    }).as('stripeJs-6');
  });

  it("executes the full 'Purchase ID' flow", () => {
    cy.visit('http://localhost:3000');

    /* --- PURCHASE ID / UPLOAD ID STEP --- */
    cy.get('button').contains('Purchase ID').click();
    // Fill in email input with 'test@localhost.com'
    cy.get('input[type="email"]').type('test@localhost.com');
    // Fill in password and confirm password inputs with 'password'
    cy.get('input[type="password"]').each(($el) => {
      cy.wrap($el).type('password');
    });
    // Intercept the API response
    cy.intercept('POST', `${API_BASE_URL}/register`, {
      statusCode: 200,
      body: registerFixture,
    }).as('register');
    // Click button with text 'Next'
    cy.get('button').contains('Next').click();

    /* --- VERIFY EMAIL STEP --- */
    cy.contains('Verify email');
    // Fill in 'xyzw' in the text input
    cy.get('input[type="text"]').type('xyzw');
    // Intercept the API response
    cy.intercept('POST', `${API_BASE_URL}/verify-account`, {
      statusCode: 200,
      body: verifyAccountFixture,
    }).as('verifyAccount');

    /* --- SELECT PLANET STEP --- */
    cy.get('button').contains('Next').click();
    // Click div with text '~lopbud-forfyl'
    cy.get('div').contains('~lopbud-forfyl').click();

    /* --- PAYMENT STEP --- */
    cy.get('button').contains('Next').click();
    // Intercept POST '/stripe-make-payment'
    cy.intercept('POST', `${API_BASE_URL}/stripe-make-payment`, {
      statusCode: 200,
      body: stripeMakePaymentFixture,
    }).as('stripeMakePayment');
    // Intercept POST /user/raise-alarm
    cy.intercept('POST', `${API_BASE_URL}/user/raise-alarm`, {
      statusCode: 200,
      body: raiseAlarmFixture,
    }).as('raiseAlarm');
    // Intercept PUT /update-payment-status
    cy.intercept('PUT', `${API_BASE_URL}/update-payment-status`, {
      statusCode: 200,
      body: {},
    }).as('updatePaymentStatus');
    // Intercept PUT /update-planet-status
    cy.intercept('PUT', `${API_BASE_URL}/update-planet-status`, {
      statusCode: 200,
      body: {},
    }).as('updatePlanetStatus');
    // Intercept POST /provisional-ship-entry
    cy.intercept('POST', `${API_BASE_URL}/provisional-ship-entry`, {
      statusCode: 200,
      body: provisionalShipEntryFixture,
    }).as('provisionalShipEntry');

    // Fill card number input with '4242424242424242'
    cy.fillElementsInput('cardNumber', '4242424242424242');
    // Fill expiry date input with '12/24'
    cy.fillElementsInput('cardExpiry', '12/24');
    // Fill CVC input with '123'
    cy.fillElementsInput('cardCvc', '123');
    // Click button with text 'Submit'
    cy.get('button').contains('Submit').click();

    /* --- BOOTING STEP --- */
    // Intercept first 4 GET /get-user-ships, then click button with text 'Next'
    cy.intercept('GET', `${API_BASE_URL}/get-user-ships`, {
      statusCode: 200,
      body: getUserShipsFixture,
    }).as('getUserShips');

    // Wait until GET /get-user-ships is called
    cy.wait('@getUserShips', { timeout: 10000 });
    cy.wait('@getUserShips', { timeout: 10000 });
    cy.wait('@getUserShips', { timeout: 10000 });
    cy.wait('@getUserShips', { timeout: 10000 });

    // Wait until Next button is enabled and click it
    cy.get('button').contains('Next').should('not.be.disabled').click();

    /* --- CREDENTIALS STEP --- */
    cy.contains('Credentials');
    cy.contains('Save this information');
    cy.contains('~lopbud-forfyl');
    cy.get('button').contains('Next').should('not.be.disabled').click();

    /* --- DOWNLOAD STEP --- */
    cy.contains('Download Realm for desktop');
    cy.get('button').contains('Go to account').should('not.be.disabled');
  });
});
