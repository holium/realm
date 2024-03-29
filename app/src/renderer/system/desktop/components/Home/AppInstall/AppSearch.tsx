import { useCallback, useEffect, useMemo, useRef } from 'react';
import { createField, createForm } from 'mobx-easy-form';
import { observer } from 'mobx-react';
import { isValidPatp } from 'urbit-ob';
import * as yup from 'yup';

import { Flex, Text } from '@holium/design-system/general';
import { TextInput } from '@holium/design-system/inputs';

import { useShipStore } from 'renderer/stores/ship.store';

import { useAppInstaller } from './store';

interface AppSearchProps {
  mode: 'home' | 'space';
}

export const searchForm = (
  defaults: any = {
    search: '',
  }
) => {
  const form = createForm({
    onSubmit({ values }) {
      return values;
    },
  });

  const search = createField({
    id: 'search',
    form,
    initialValue: defaults.name || '',
    validationSchema: yup.string().required('Name is required'),
  });

  return {
    form,
    search,
  };
};

const dimensions = { height: 450, width: 550 };

const AppSearchAppPresenter = (props: AppSearchProps) => {
  const { bazaarStore } = useShipStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const appInstaller = useAppInstaller();
  const searchString = appInstaller.searchString;
  const searchMode = appInstaller.searchMode;
  const searchPlaceholder = appInstaller.searchPlaceholder;
  const selectedShip = appInstaller.selectedShip;

  useEffect(() => {
    // prevents UI crash
    bazaarStore.scryAllies().catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    appInstaller.reset();
  }, [appInstaller]);

  const { search } = useMemo(() => searchForm(), []);

  const clearInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = '';
      if (selectedShip !== '') {
        inputRef.current.focus();
      }
    }
  }, [selectedShip]);

  useEffect(() => {
    if (searchMode === 'app-summary') {
      if (inputRef.current) {
        inputRef.current.value = searchString;
      }
    } else if (searchMode === 'dev-app-search') {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } else if (searchMode === 'none') {
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  }, [searchMode]);

  useEffect(() => {
    if (searchString === '' && search.state.value !== '') {
      search.actions.onChange('');
      clearInput();
    }
  }, [
    clearInput,
    search.actions,
    search.state.value,
    searchString,
    selectedShip,
  ]);

  const popoverId = 'app-install';

  const width = props.mode === 'home' ? 500 : 450;

  return (
    <Flex width={width} id={`${popoverId}-container`}>
      <Flex
        id={`${popoverId}-trigger`}
        width={width}
        onClick={() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }}
      >
        <TextInput
          ref={inputRef}
          flex={8}
          id={`${popoverId}-input`}
          name="app-search"
          type="text"
          placeholder={searchPlaceholder}
          style={{
            borderRadius: 25,
            height: 42,
            width,
            paddingLeft: 12,
            paddingRight: 16,
            backgroundColor: 'rgba(var(--rlm-window-rgba), 0.5)',
            backdropFilter: 'blur(10px)',
          }}
          inputStyle={{
            background: 'transparent',
          }}
          leftAdornment={
            <Flex height="100%" col justify="center">
              {(searchMode === 'dev-app-search' ||
                searchMode === 'app-summary') &&
              selectedShip !== '' ? (
                <Text.Custom color="accent" mr={0} pb={0} fontWeight={500}>
                  Apps by {selectedShip}
                </Text.Custom>
              ) : (
                <></>
              )}
            </Flex>
          }
          onKeyDown={(evt: any) => {
            evt.stopPropagation();
            if (evt.key === 'Enter' && isValidPatp(searchString)) {
              appInstaller.setSearchMode('dev-app-search');
              appInstaller.setSearchPlaceholder('Search...');
              appInstaller.setSelectedShip(searchString);
              appInstaller.setSearchModeArgs([searchString]);
              appInstaller.setSearchString('');
              search.actions.onChange('');
              clearInput();
            }
            if (
              evt.key === 'Escape' &&
              searchMode !== 'dev-app-search' &&
              searchString.length === 0
            ) {
              appInstaller.reset();
              search.actions.onChange('');
            }
            if (
              evt.key === 'Backspace' &&
              searchMode === 'dev-app-search' &&
              searchString.length === 0
            ) {
              appInstaller.setSearchMode('start');
              appInstaller.setSearchPlaceholder('Search...');
              appInstaller.setSelectedShip('');
              appInstaller.setSearchString('');
              search.actions.onChange('');
              search.actions.onFocus();
            }
          }}
          defaultValue={search.state.value}
          onChange={(evt: any) => {
            evt.stopPropagation();
            search.actions.onChange(evt.target.value);
            appInstaller.setSearchString(evt.target.value);
            if (evt.target.value) {
              if (evt.target.value[0] === '~') {
                appInstaller.setSearchMode('ship-search');
              } else {
                if (['app-search', 'dev-app-search'].includes(searchMode)) {
                  appInstaller.setSearchMode(searchMode);
                } else {
                  appInstaller.setSearchMode('app-search');
                }
              }
            } else {
              if (evt.key === 'Backspace') {
                appInstaller.setSearchMode('start');
              }
            }
          }}
          onFocus={(evt) => {
            evt.stopPropagation();
            appInstaller.open(`${popoverId}-container`, dimensions);
            if (selectedShip) {
              appInstaller.setSearchMode('dev-app-search');
              appInstaller.setSearchModeArgs([selectedShip]);
            } else if (searchString) {
              if (searchString.startsWith('~')) {
                appInstaller.setSearchMode('ship-search');
              } else {
                appInstaller.setSearchMode('app-search');
              }
            } else {
              appInstaller.setSearchMode('start');
            }
            search.actions.onFocus();
          }}
          onBlur={() => {
            search.actions.onBlur();
          }}
        />
      </Flex>
    </Flex>
  );
};

export const AppSearchApp = observer(AppSearchAppPresenter);
