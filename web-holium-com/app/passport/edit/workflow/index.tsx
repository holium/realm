import { useState } from 'react';

import { CheckIcon, CopyIcon, PassportIcon } from '@/app/assets/icons';
import { StyledSpinner } from '@/app/components';
import { PassportProfile } from '@/app/lib/types';

const renderAddress = (address: `0x${string}` | undefined) => {
  if (!address) return 'unknown';
  const parts = [
    address.substring(0, 6),
    address.substring(address.length - 4),
  ];
  return parts.join('...');
};

export type WorkflowStep =
  | 'none'
  | 'welcome'
  | 'confirm-passport-root'
  | 'confirm-device-signing-key'
  | 'confirm-add-address';

export interface PassportWorkflowState {
  currentStep: WorkflowStep;
  passport: PassportProfile;
  walletAddress?: `0x${string}`;
  deviceSigningKey?: `0x${string}`;
}

interface PassportWorkflowProps {
  state: PassportWorkflowState;
  onNextWorkflowStep: (workflowState: PassportWorkflowState) => Promise<void>;
}

export function RenderWorkflowInitializeStep({
  state,
  onNextWorkflowStep,
}: PassportWorkflowProps) {
  const [loadingState, setLoadingState] = useState<string>('default');
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        color: '#FFFFFF',
        borderRadius: '16px',
        backgroundColor: '#4292F1',
        padding: '12px',
        gap: 12,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <PassportIcon />
        <div
          style={{
            marginLeft: '12px',
            fontWeight: 450,
            fontSize: '1.2em',
          }}
        >
          Passport
        </div>
      </div>
      <div style={{ fontSize: '0.9em', fontWeight: 300 }}>
        Once you initialize your passport you will be able to associate your
        Urbit ID with wallet addresses and NFTs through cryptographic
        verification.
      </div>
      <hr
        style={{
          backgroundColor: '#7199F0',
          width: '100%',
          height: '1px',
          border: 0,
          // opacity: '10%',
        }}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          borderRadius: '38px',
          border: 'solid 2px #91B0E9',
          backgroundColor: '#739BEC',
          alignItems: 'center',
          padding: '8px 12px',
          // lineHeight: '34px',
        }}
      >
        <div
          style={{
            display: 'flex',
            // padding: 0,
            lineHeight: '30px',
            width: '30px',
            height: '30px',
            border: 0,
            borderRadius: '50%',
            backgroundColor: '#8CAEF0',
            fontWeight: 450,
            fontSize: '18px',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          1
        </div>
        <div style={{ flex: 1, fontSize: '0.9em', marginLeft: '8px' }}>
          Link an Ethereum address as your root signing key.
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          borderRadius: '38px',
          border: 'solid 2px #91B0E9',
          backgroundColor: '#739BEC',
          alignItems: 'center',
          padding: '8px 12px',
          // lineHeight: '34px',
        }}
      >
        <div
          style={{
            display: 'flex',
            // padding: 0,
            lineHeight: '30px',
            width: '30px',
            height: '30px',
            border: 0,
            borderRadius: '50%',
            backgroundColor: '#8CAEF0',
            fontWeight: 450,
            fontSize: '18px',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          2
        </div>
        <div style={{ flex: 1, fontSize: '0.9em', marginLeft: '8px' }}>
          Generate a device-specific signing key and adds it to your signature
          chain.
        </div>
      </div>
      <hr
        style={{
          backgroundColor: '#7199F0',
          width: '100%',
          height: '1px',
          border: 0,
          // opacity: '10%',
        }}
      />
      <button
        style={{
          borderRadius: '10px',
          backgroundColor: '#FFFFFF',
          color: '#4292F1',
          lineHeight: '22px',
          padding: '13px 0',
        }}
        onClick={() => {
          setLoadingState('initializing');
          onNextWorkflowStep(state).then(() => setLoadingState('default'));
        }}
        // onClick={() => passportWorkflow.current?.close()}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <div>Initialize your passport</div>
          {loadingState === 'initializing' && (
            <StyledSpinner color="#4292F1" size={12} width={1.5} />
          )}
        </div>
      </button>
    </div>
  );
}

export function RenderWorkflowLinkRootStep({
  state,
  onNextWorkflowStep,
}: PassportWorkflowProps) {
  const [loadingState, setLoadingState] = useState<string>('default');
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        color: '#FFFFFF',
        borderRadius: '16px',
        backgroundColor: '#4292F1',
        padding: '12px',
        gap: 14,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            // padding: 0,
            lineHeight: '30px',
            width: '30px',
            height: '30px',
            border: 0,
            borderRadius: '50%',
            backgroundColor: '#8CAEF0',
            fontWeight: 450,
            fontSize: '18px',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          1
        </div>
        <div
          style={{
            marginLeft: '12px',
            fontWeight: 450,
            fontSize: '1.2em',
          }}
        >
          Link root address
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          borderRadius: '38px',
          border: 'solid 2px #91B0E9',
          backgroundColor: '#739BEC',
          alignItems: 'center',
          padding: '8px 12px',
          // lineHeight: '34px',
        }}
      >
        {/* render the wallet icon here */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '0 12px',
          }}
        >
          <div style={{ fontSize: '0.8em' }}>Root wallet address</div>
          <div style={{ fontSize: '1em' }}>
            {renderAddress(state.walletAddress)}
          </div>
        </div>
      </div>
      <div style={{ fontSize: '0.9em', fontWeight: 300 }}>
        You’ve connected the wallet address listed above. If this is the correct
        address, confirm below and it will create your Passport.
      </div>
      <hr
        style={{
          backgroundColor: '#7199F0',
          width: '100%',
          height: '1px',
          border: 0,
          // opacity: '10%',
        }}
      />
      <button
        style={{
          borderRadius: '10px',
          backgroundColor: '#FFFFFF',
          color: '#4292F1',
          lineHeight: '22px',
          padding: '13px 0',
        }}
        onClick={() => onNextWorkflowStep(state)}
      >
        Confirm root address
      </button>
    </div>
  );
}

export function RenderWorkflowLinkDeviceKeyStep({
  state,
  onNextWorkflowStep,
}: PassportWorkflowProps) {
  console.log('RenderWorkflowLinkDeviceKeyStep');
  const [loadingState, setLoadingState] = useState<string>('default');
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        color: '#FFFFFF',
        borderRadius: '16px',
        backgroundColor: '#4292F1',
        padding: '12px',
        gap: 12,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            // padding: 0,
            lineHeight: '30px',
            width: '30px',
            height: '30px',
            border: 0,
            borderRadius: '50%',
            backgroundColor: '#8CAEF0',
            fontWeight: 450,
            fontSize: '18px',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          2
        </div>
        <div
          style={{
            marginLeft: '12px',
            fontWeight: 450,
            fontSize: '1.2em',
          }}
        >
          Generate device key
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          borderRadius: '38px',
          border: 'solid 2px #91B0E9',
          backgroundColor: '#739BEC',
          alignItems: 'center',
          padding: '8px 12px',
          // lineHeight: '34px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '0 12px',
            flex: 1,
          }}
        >
          <div style={{ fontSize: '0.8em' }}>Root wallet address</div>
          <div style={{ fontSize: '1em', flex: 1 }}>
            {renderAddress(state.walletAddress)}
          </div>
        </div>
        <CheckIcon />
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          borderRadius: '38px',
          border: 'solid 2px #91B0E9',
          backgroundColor: '#739BEC',
          alignItems: 'center',
          padding: '8px 12px',
          // lineHeight: '34px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '0 12px',
            flex: 1,
          }}
        >
          <div style={{ fontSize: '0.8em' }}>Device signing key</div>
          <div style={{ fontSize: '1em', flex: 1 }}>
            <input
              type="password"
              readOnly={true}
              value={state.deviceSigningKey || 'none'}
              style={{ backgroundColor: '#739BEC', color: '#ffffff' }}
            ></input>
          </div>
        </div>
        <CopyIcon />
      </div>
      <div style={{ fontSize: '0.9em', fontWeight: 300 }}>
        We’ve generated a device signing key for you. Please sign the new device
        key with your root address by clicking the button below.
      </div>
      <hr
        style={{
          backgroundColor: '#7199F0',
          width: '100%',
          height: '1px',
          border: 0,
          // opacity: '10%',
        }}
      />
      <button
        style={{
          borderRadius: '10px',
          backgroundColor: '#FFFFFF',
          color: '#4292F1',
          lineHeight: '22px',
          padding: '13px 0',
        }}
        onClick={() => onNextWorkflowStep(state)}
      >
        Sign and add key
      </button>
    </div>
  );
}

export function RenderWorkflowLinkAddressStep({
  state,
  onNextWorkflowStep,
}: PassportWorkflowProps) {
  console.log('RenderWorkflowLinkAddressStep');
  // const [loadingState, setLoadingState] = useState<string>('default');
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        color: '#FFFFFF',
        borderRadius: '16px',
        backgroundColor: '#4292F1',
        padding: '12px',
        gap: 12,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <PassportIcon />
        <div
          style={{
            marginLeft: '12px',
            fontWeight: 450,
            fontSize: '1.2em',
          }}
        >
          Add address
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          borderRadius: '38px',
          border: 'solid 2px #91B0E9',
          backgroundColor: '#739BEC',
          alignItems: 'center',
          padding: '8px 12px',
          // lineHeight: '34px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '0 12px',
            flex: 1,
          }}
        >
          <div style={{ fontSize: '0.8em' }}>Wallet address</div>
          <div style={{ fontSize: '1em', flex: 1 }}>
            {renderAddress(state.walletAddress)}
          </div>
        </div>
        <CheckIcon />
      </div>
      <div style={{ fontSize: '0.9em', fontWeight: 300 }}>
        You’ve connected the wallet address listed above. If this is the correct
        address, confirm below and it will add this address to your Passport.
      </div>
      <div style={{ fontWeight: 450, fontSize: '0.9em' }}>
        Note: This new address will be signed using your device signing key.
      </div>
      <hr
        style={{
          backgroundColor: '#7199F0',
          width: '100%',
          height: '1px',
          border: 0,
          // opacity: '10%',
        }}
      />
      <button
        style={{
          borderRadius: '10px',
          backgroundColor: '#FFFFFF',
          color: '#4292F1',
          lineHeight: '22px',
          padding: '13px 0',
        }}
        onClick={() => onNextWorkflowStep(state)}
      >
        Sign and add key
      </button>
    </div>
  );
}
