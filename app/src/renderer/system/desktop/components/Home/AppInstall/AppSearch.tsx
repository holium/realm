import { useCallback, useEffect, useMemo, useRef } from 'react';
import { createField, createForm } from 'mobx-easy-form';
import { observer } from 'mobx-react';
import { isValidPatp } from 'urbit-ob';
import * as yup from 'yup';

import { Flex, Text, TextInput } from '@holium/design-system';

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

  console.log('AppSearchAppPresenter render');

  useEffect(() => {
    console.log('scrying allies...');
    bazaarStore.scryAllies();
  }, []);

  useEffect(() => {
    console.log('appInstaller change. setting vars...');
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
    console.log('fields changed');
    if (searchString === '' && search.state.value !== '') {
      search.actions.onChange('');
      clearInput();
      console.log('selectedShip', selectedShip);
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
              {searchMode === 'dev-app-search' && selectedShip !== '' ? (
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
            }
          }}
          defaultValue={search.state.value}
          onChange={(evt) => {
            evt.stopPropagation();
            // @ts-ignore
            // @ts-ignore
            search.actions.onChange(evt.target.value);
            // @ts-ignore
            appInstaller.setSearchString(evt.target.value);
            // @ts-ignore
            if (evt.target.value) {
              // @ts-ignore
              if (evt.target.value[0] === '~') {
                appInstaller.setSearchMode('ship-search');
                // setData([]);
              } else {
                if (['app-search', 'dev-app-search'].includes(searchMode)) {
                  appInstaller.setSearchMode(searchMode);
                } else {
                  appInstaller.setSearchMode('app-search');
                }
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
            appInstaller.reset();
            search.actions.onBlur();
          }}
        />
      </Flex>
    </Flex>
  );
};

export const AppSearchApp = observer(AppSearchAppPresenter);
