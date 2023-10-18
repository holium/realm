import { useState } from 'react';

import {
  CheckIcon,
  CloseIcon,
  CopyIcon,
  ErrorIcon,
  PassportIcon,
} from '@/app/assets/icons';
import { StyledSpinner } from '@/app/components';
import { PassportProfile } from '@/app/lib/types';

export const renderAddress = (address: `0x${string}` | undefined) => {
  if (!address) return 'unknown';
  const parts = [
    address.substring(0, 6),
    address.substring(address.length - 4),
  ];
  return parts.join('...');
};

export type WorkflowStep =
  | 'none'
  | 'new-device'
  | 'welcome'
  | 'confirm-passport-root'
  | 'confirm-device-signing-key'
  | 'confirm-add-address';

export type WorkflowStepReadyState = 'ready' | 'loading' | 'error';

export interface PassportWorkflowState {
  currentStep: WorkflowStep;
  readyState?: WorkflowStepReadyState;
  lastError?: any;
  passport: PassportProfile;
  walletAddress?: string;
  deviceSigningKey?: string;
}

interface PassportWorkflowProps {
  state: PassportWorkflowState;
  onNextWorkflowStep: (workflowState: PassportWorkflowState) => Promise<void>;
  onCloseWorkflow: () => void;
}

interface WorkflowStepRenderState {
  readyState: WorkflowStepReadyState;
  lastError?: any;
}

export function RenderWorkflowNoneState() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-empty-pattern
  const [] = useState<WorkflowStepRenderState>({
    readyState: 'ready',
  });
  return <></>;
}

export function RenderWorkflowInitializeStep({
  state,
  onNextWorkflowStep,
  onCloseWorkflow,
}: PassportWorkflowProps) {
  const [renderState, setRenderState] = useState<WorkflowStepRenderState>({
    readyState: 'ready',
  });
  console.log(
    'RenderWorkflowInitializeStep: readyState => %o',
    renderState.readyState
  );
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        // color: '#FFFFFF',
        // borderRadius: '16px',
        // backgroundColor: '#4292F1',
        padding: '0 12px 12px',
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
            flex: 1,
          }}
        >
          Passport
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            setRenderState({ readyState: 'ready', lastError: undefined });
            onCloseWorkflow && onCloseWorkflow();
          }}
        >
          <CloseIcon />
        </button>
      </div>
      <div style={{ fontSize: '0.9em', fontWeight: 300 }}>
        Once you initialize your passport you will be able to associate your
        Urbit ID with wallet addresses and NFTs through cryptographic
        verification.
      </div>
      <hr
        style={{
          backgroundColor: 'rgba(255,255,255, 0.2)',
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
          border: 'solid 2px rgba(255,255,255, 0.2)',
          backgroundColor: 'rgba(255,255,255, 0.2)',
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
            backgroundColor: 'rgba(255,255,255, 0.2)',
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
          border: 'solid 2px rgba(255,255,255, 0.2)',
          backgroundColor: 'rgba(255,255,255, 0.2)',
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
            backgroundColor: 'rgba(255,255,255, 0.2)',
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
          backgroundColor: 'rgba(255,255,255, 0.2)',
          width: '100%',
          height: '1px',
          border: 0,
          // opacity: '10%',
        }}
      />
      {renderState.lastError && (
        <>
          <div style={{ backgroundColor: '#ffffff', color: 'red' }}>
            {renderState.lastError.toString()}
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
        </>
      )}
      <button
        style={{
          borderRadius: '10px',
          backgroundColor: '#FFFFFF',
          color: '#4292F1',
          lineHeight: '22px',
          padding: '13px 0',
        }}
        onClick={() => {
          setRenderState({ readyState: 'loading' });
          onNextWorkflowStep(state)
            .then(() => setRenderState({ readyState: 'ready' }))
            .catch((e) => {
              console.error('error: %o', e);
              setRenderState({
                readyState: 'error',
                lastError: e,
              });
            });
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
          {renderState.readyState === 'loading' && (
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
  onCloseWorkflow,
}: PassportWorkflowProps) {
  const [renderState, setRenderState] = useState<WorkflowStepRenderState>({
    readyState: 'ready',
  });
  console.log(
    'RenderWorkflowLinkRootStep: readyState => %o',
    renderState.readyState
  );
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
            backgroundColor: 'rgba(255,255,255, 0.2)',
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
            flex: 1,
          }}
        >
          Link root address
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            setRenderState({ readyState: 'ready', lastError: undefined });
            onCloseWorkflow && onCloseWorkflow();
          }}
        >
          <CloseIcon />
        </button>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          borderRadius: '38px',
          border: 'solid 2px rgba(255,255,255, 0.2)',
          backgroundColor: 'rgba(255,255,255, 0.2)',
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
          backgroundColor: 'rgba(255,255,255, 0.2)',
          width: '100%',
          height: '1px',
          border: 0,
          // opacity: '10%',
        }}
      />
      {renderState.lastError && (
        <>
          <div style={{ backgroundColor: '#ffffff', color: 'red' }}>
            {renderState.lastError.toString()}
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
        </>
      )}
      <button
        style={{
          borderRadius: '10px',
          backgroundColor: '#FFFFFF',
          color: '#4292F1',
          lineHeight: '22px',
          padding: '13px 0',
        }}
        onClick={() => {
          setRenderState({ readyState: 'loading' });
          onNextWorkflowStep(state)
            .then(() => setRenderState({ readyState: 'ready' }))
            .catch((e) => {
              console.error('error: %o', e);
              setRenderState({
                readyState: 'error',
                lastError: e,
              });
            });
        }}
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
          <div>Confirm root address</div>
          {renderState.readyState === 'loading' && (
            <StyledSpinner color="#4292F1" size={12} width={1.5} />
          )}
        </div>
      </button>
    </div>
  );
}

export function RenderWorkflowLinkDeviceKeyStep({
  state,
  onNextWorkflowStep,
  onCloseWorkflow,
}: PassportWorkflowProps) {
  const [renderState, setRenderState] = useState<WorkflowStepRenderState>({
    readyState: 'ready',
  });
  console.log(
    'RenderWorkflowLinkDeviceKeyStep: readyState => %o',
    renderState.readyState
  );
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
            backgroundColor: 'rgba(255,255,255, 0.2)',
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
            flex: 1,
          }}
        >
          Generate device key
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            setRenderState({ readyState: 'ready', lastError: undefined });
            onCloseWorkflow && onCloseWorkflow();
          }}
        >
          <CloseIcon />
        </button>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          borderRadius: '38px',
          border: 'solid 2px rgba(255,255,255, 0.2)',
          backgroundColor: 'rgba(255,255,255, 0.2)',
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
          border: 'solid 2px rgba(255,255,255, 0.2)',
          backgroundColor: 'rgba(255,255,255, 0.2)',
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
              tabIndex={-1}
              type="password"
              readOnly={true}
              disabled={true}
              value={state.deviceSigningKey || 'none'}
              style={{
                backgroundColor: 'rgba(255,255,255, 0)',
                color: '#ffffff',
                border: 0,
                width: '100%',
              }}
            ></input>
          </div>
        </div>
        <button>
          <CopyIcon />
        </button>
      </div>
      <div style={{ fontSize: '0.9em', fontWeight: 300 }}>
        We’ve generated a device signing key for you. Please sign the new device
        key with your root address by clicking the button below.
      </div>
      <hr
        style={{
          backgroundColor: 'rgba(255,255,255, 0.2)',
          width: '100%',
          height: '1px',
          border: 0,
          // opacity: '10%',
        }}
      />
      {renderState.lastError && (
        <>
          <div style={{ backgroundColor: '#ffffff', color: 'red' }}>
            {renderState.lastError.toString()}
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
        </>
      )}
      <button
        style={{
          borderRadius: '10px',
          backgroundColor: '#FFFFFF',
          color: '#4292F1',
          lineHeight: '22px',
          padding: '13px 0',
        }}
        onClick={() => {
          setRenderState({ readyState: 'loading' });
          onNextWorkflowStep(state)
            .then(() => setRenderState({ readyState: 'ready' }))
            .catch((e) => {
              console.error('error: %o', e);
              setRenderState({
                readyState: 'error',
                lastError: e,
              });
            });
        }}
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
          <div>Sign and add key</div>
          {renderState.readyState === 'loading' && (
            <StyledSpinner color="#4292F1" size={12} width={1.5} />
          )}
        </div>
      </button>
    </div>
  );
}

export function RenderWorkflowLinkAddressStep({
  state,
  onNextWorkflowStep,
  onCloseWorkflow,
}: PassportWorkflowProps) {
  const [renderState, setRenderState] = useState<WorkflowStepRenderState>({
    readyState: 'ready',
  });
  console.log(
    'RenderWorkflowLinkAddressStep: readyState => %o',
    renderState.readyState
  );
  return (
    <dialog
      id="passportWorkflowDialog"
      open={true}
      style={{
        borderRadius: '24px',
        padding: '12px',
        width: '400px',
        minWidth: '400px',
        backgroundColor: '#4292F1',
        color: '#ffffff',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          // gap: 8,
        }}
      >
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
                flex: 1,
              }}
            >
              Add address
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                setRenderState({ readyState: 'ready', lastError: undefined });
                onCloseWorkflow && onCloseWorkflow();
              }}
            >
              <CloseIcon />
            </button>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              borderRadius: '38px',
              border: 'solid 2px rgba(255,255,255, 0.2)',
              backgroundColor: 'rgba(255,255,255, 0.2)',
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
                {renderAddress(state.walletAddress as `0x${string}`)}
              </div>
            </div>
            <CheckIcon />
          </div>
          <div style={{ fontSize: '0.9em', fontWeight: 300 }}>
            You’ve connected the wallet address listed above. If this is the
            correct address, confirm below and it will add this address to your
            Passport.
          </div>
          <div style={{ fontWeight: 450, fontSize: '0.9em' }}>
            Note: This new address will be signed using your device signing key.
          </div>
          <hr
            style={{
              backgroundColor: 'rgba(255,255,255, 0.2)',
              width: '100%',
              height: '1px',
              border: 0,
              // opacity: '10%',
            }}
          />
          {renderState.lastError && (
            <>
              <div style={{ backgroundColor: '#ffffff', color: 'red' }}>
                {renderState.lastError.toString()}
              </div>
              <hr
                style={{
                  backgroundColor: 'rgba(255,255,255, 0.2)',
                  width: '100%',
                  height: '1px',
                  border: 0,
                  // opacity: '10%',
                }}
              />
            </>
          )}
          <button
            style={{
              borderRadius: '10px',
              backgroundColor: '#FFFFFF',
              color: '#4292F1',
              lineHeight: '22px',
              padding: '13px 0',
            }}
            onClick={() => {
              setRenderState({ readyState: 'loading' });
              onNextWorkflowStep(state)
                .then(() => setRenderState({ readyState: 'ready' }))
                .catch((e) => {
                  console.error('error: %o', e);
                  setRenderState({
                    readyState: 'error',
                    lastError: e,
                  });
                });
            }}
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
              <div>Sign and add key</div>
              {renderState.readyState === 'loading' && (
                <StyledSpinner color="#4292F1" size={12} width={1.5} />
              )}
            </div>
          </button>
        </div>
      </div>
    </dialog>
  );
}

interface PassportRenderProps {
  signingAddress: string;
  mnemonic: string;
  readyState: PageReadyState;
  onConfirm: () => void;
}

export type PageReadyState = 'ready' | 'loading' | 'error';

export interface PageRenderState {
  readyState?: PageReadyState;
  lastError?: any;
}

export function RenderGetStartedStep({
  signingAddress,
  mnemonic,
  readyState,
  onConfirm,
}: PassportRenderProps) {
  const words = mnemonic.split(' ');
  console.log('RenderGetStartedStep: readyState => %o', readyState);
  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          padding: '12px',
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
              flex: 1,
            }}
          >
            Passport - Welcome
          </div>
        </div>
        <hr
          style={{
            backgroundColor: 'rgba(255,255,255, 0.2)',
            width: '100%',
            height: '1px',
            border: 0,
          }}
        />
        <div style={{ fontWeight: 'normal' }}>
          Before you get started, we've generated a device signing key for you.
          This new device key allows us to cryptographically verify any changes
          you make to your passport. Here are the details:
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            borderRadius: '8px',
            border: 'solid 2px rgba(255,255,255, 0.2)',
            backgroundColor: 'rgba(255,255,255, 0.2)',
            alignItems: 'center',
            padding: '8px 12px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '0 12px',
              flex: 1,
              flexWrap: 'wrap',
              width: '100%',
            }}
          >
            <div style={{ fontSize: '0.8em' }}>Device signer address</div>
            <div style={{ fontSize: '1em', flex: 1 }}>
              {renderAddress(signingAddress as `0x${string}`)}
            </div>
            {words.length === 12 && (
              <div
                style={{
                  marginTop: '8px',
                  display: 'grid',
                  width: '100%',
                  flexWrap: 'wrap',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 8,
                }}
              >
                {words.map((word: string, idx: number) => (
                  <div key={`word-${idx}`}>{word}</div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div style={{ fontWeight: 'normal' }}>
          Click the 'Confirm' button to accept this device key and get started.
        </div>
        <hr
          style={{
            backgroundColor: 'rgba(255,255,255, 0.2)',
            width: '100%',
            height: '1px',
            border: 0,
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
            onConfirm && onConfirm();
          }}
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
            <div>Confirm New Device Key</div>
            {readyState === 'loading' && (
              <StyledSpinner color="#4292F1" size={12} width={1.5} />
            )}
            {readyState === 'error' && <ErrorIcon />}
          </div>
        </button>
      </div>
    </div>
  );
}

export function RenderDeviceKeyRecovery({
  readyState,
  words,
  setWords,
  onConfirm,
}: any) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          padding: '12px',
        }}
      >
        <div style={{ fontWeight: 'normal' }}>
          Your device key could not be found, but there are wallet addresses
          associated with your passport.
        </div>
        <div style={{ fontWeight: 'normal' }}>
          You can recover the device address by entering the recovery phrase
          that was generated when you first enrolled this device.
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 8,
          }}
        >
          {words.map((word: string, idx: number) => (
            <div
              key={`txt-${idx}`}
              style={{
                borderRadius: '4px',
                border: 'solid 2px rgba(255,110,110, 0.25)',
                textAlign: 'center',
              }}
            >
              <input
                maxLength={10}
                style={{
                  fontSize: '0.8em',
                  outline: 'none',
                  height: '24px',
                  width: '72px',
                  textAlign: 'center',
                  border: 0,
                }}
                onPaste={(event) => {
                  event.stopPropagation();
                  event.preventDefault();
                  let data = event.clipboardData || window.clipboardData;
                  let txt: string = data.getData('Text') as string;
                  if (idx === 0) {
                    const segments = txt.split(' ');
                    let updated = Array(12).fill('');
                    for (let i = 0; i < 12; i++) {
                      if (segments.length > i) {
                        updated[i] = segments[i];
                      }
                    }
                    setWords(updated);
                  } else {
                    words[idx] = txt;
                    setWords(words);
                  }
                }}
                defaultValue={words[idx]}
                // value={word}
                onChange={(e) => {
                  words[idx] = e.target.value;
                  setWords(words);
                }}
              ></input>
            </div>
          ))}
        </div>
        <div style={{ fontWeight: 'normal' }}>
          Click the 'Confirm' button to accept this phrase recover your device
          key.
        </div>
        <hr
          style={{
            backgroundColor: 'rgba(255,255,255, 0.2)',
            width: '100%',
            height: '1px',
            border: 0,
          }}
        />
        <button
          style={{
            borderRadius: '10px',
            backgroundColor: '#FFFFFF',
            color: '#4292F1',
            lineHeight: '22px',
            padding: '0px 0',
          }}
          onClick={() => {
            onConfirm && onConfirm(readyState);
          }}
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
            <div>Confirm New Device Key</div>
            {readyState === 'loading' && (
              <StyledSpinner color="#4292F1" size={12} width={1.5} />
            )}
            {readyState === 'error' && <ErrorIcon />}
          </div>
        </button>
      </div>
    </div>
  );
}
