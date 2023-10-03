import { PassportProfile } from '@/app/lib/types';

import { PassportIcon } from '@/app/assets/icons';

interface PassportWorkflowState {
  currentStep: number;
  passport: PassportProfile;
  walletAddress?: `0x${string}`;
  deviceSigningKey?: `0x${string}`;
}

interface PassportWorkflowProps {
  state: PassportWorkflowState;
  onNextWorkflowStep: (workflowState: PassportWorkflowState) => void;
}

export function renderWorkflowInitializeStep({
  workflowState: PassportWorkflowState,
  onNextWorkflowStep,
}: PassportWorkflowProps) {
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
        onClick={() => onNextWorkflowStep(step)}
        // onClick={() => passportWorkflow.current?.close()}
      >
        Initialize your passport
      </button>
    </div>
  );
}

export function renderWorkflowLinkRootStep({
  step,
  walletAddress,
  passport,
  onNextWorkflowStep,
}: PassportWorkflowProps) {
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
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '0.8em' }}>Root wallet address</div>
          <div style={{ fontSize: '1em' }}>{walletAddress || 'not founds'}</div>
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
        onClick={() => onNextWorkflowStep(step)}
      >
        Confirm root address
      </button>
    </div>
  );
}
