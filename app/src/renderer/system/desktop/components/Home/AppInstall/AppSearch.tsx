import { useCallback, useEffect, useMemo, useRef } from 'react';
import { isValidPatp } from 'urbit-ob';
import { observer } from 'mobx-react';
import { Input, Flex } from 'renderer/components';
import { SpacesActions } from 'renderer/logic/actions/spaces';
import { useAppInstaller } from './store';
import * as yup from 'yup';
import { createField, createForm } from 'mobx-easy-form';
import { AppSearchPopover } from './AppSearchPopover';

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

const AppSearchApp = observer((props: AppSearchProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const appInstaller = useAppInstaller();
  const searchString = appInstaller.searchString;
  const searchMode = appInstaller.searchMode;
  const searchPlaceholder = appInstaller.searchPlaceholder;
  const selectedShip = appInstaller.selectedShip;

  useEffect(() => {
    SpacesActions.scryAllies();
  }, []);

  useEffect(() => {
    appInstaller.setSearchMode('none');
    appInstaller.setSearchModeArgs([]);
    appInstaller.setSearchString('');
    appInstaller.setSearchPlaceholder('Search...');
    appInstaller.setSelectedShip('');
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
    <Flex width={width}>
      <Input
        ref={inputRef}
        flex={8}
        id={`${popoverId}-trigger`}
        className="realm-cursor-text-cursor"
        type="text"
        placeholder={searchPlaceholder}
        bgOpacity={0.3}
        borderColor={'input.borderHover'}
        bg="bg.blendedBg"
        wrapperStyle={{
          borderRadius: 25,
          height: 42,
          width,
          paddingLeft: 12,
          paddingRight: 16,
        }}
        leftLabel={
          searchMode === 'dev-app-search' && selectedShip !== ''
            ? `Apps by ${selectedShip}:`
            : 'none'
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
          console.log(evt.key);
          if (
            evt.key === 'Escape' &&
            searchMode !== 'dev-app-search' &&
            searchString.length === 0
          ) {
            appInstaller.setSearchPlaceholder('Search...');
            appInstaller.setSelectedShip('');
            appInstaller.setSearchString('');
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
          search.actions.onChange(evt.target.value);
          appInstaller.setSearchString(evt.target.value);
          if (evt.target.value) {
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
          appInstaller.open(`${popoverId}-trigger`, dimensions);
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
      <AppSearchPopover />
    </Flex>
  );
});

export default AppSearchApp;
