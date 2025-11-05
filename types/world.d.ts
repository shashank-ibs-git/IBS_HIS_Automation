import type { Page } from 'playwright';
import type { POManager } from '../pageObjectsHIS/POManager';
import type { TopPage } from '../pageObjectsHIS/TopPage';
import type { SearchResultsPage } from '../pageObjectsHIS/SearchResultsPage';
import type { PassengerInfoPage } from '../pageObjectsHIS/PassengerInfoPage';
import type { AdditionalServicePage } from '../pageObjectsHIS/AdditionalServicePage';
import type { ConfirmInputPage } from '../pageObjectsHIS/ConfirmInputPage';
import type { PaymentPage } from '../pageObjectsHIS/PaymentPage';
import type { EnterPaymentPage } from '../pageObjectsHIS/EnterPaymentPage';
import type { LoginFlightBaseModule } from '../pageObjectsHIS/LoginFlightBaseModule';
import type { Utilities } from '../HIS_FLIGHTBASE_B2C/features/support/Utilities';
import type { ReservationCompletePage } from '../pageObjectsHIS/ReservationCompletePage';

declare global {
  interface CustomWorld {
    page: Page;
    poManager: POManager;
    topPage: TopPage;
    searchResultsPage: SearchResultsPage;
    passengerInfoPage: PassengerInfoPage;
    additionalServicePage: AdditionalServicePage;
    confirmInputPage: ConfirmInputPage;
    paymentPage: PaymentPage;
    enterPaymentPage: EnterPaymentPage;
    loginFlightBaseModule: LoginFlightBaseModule;
    reservationCompletePage: ReservationCompletePage;
      utils: Utilities;
      testData: any; // loaded from testData.json and attached in hooks
      ASSERT_TIMEOUT: number; // centralized assertion timeout from testData or fallback
  datasetName?: string; // selected dataset (TEST_DATA env var)
      runtimeConfig?: {
        env?: string;
        baseUrl?: string;
        browser?: string;
        headless?: boolean;
        [key: string]: any;
      }; // environment/runtime settings from testConfig_HIS.json (future use)
      // allow ad-hoc properties set on `this` in step files (e.g. this.priceAtReturnDetailsSection)
      [key: string]: any;
  }
}

export {};
