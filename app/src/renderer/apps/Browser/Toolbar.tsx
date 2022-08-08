import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { createField, createForm } from 'mobx-easy-form';
import normalizeUrl from 'normalize-url';

import { TitlebarStyle } from 'renderer/system/desktop/components/Window/Titlebar';
import { Flex, Icons, Input, Spinner } from 'renderer/components';
import { WindowIcon } from 'renderer/system/desktop/components/Window/WindowIcon';
import { useBrowser } from './store';
import { useServices } from 'renderer/logic/store';

const ToolbarStyle = styled(TitlebarStyle)`
  /* height: 42px; */
  padding: 0 10px;
  background: transparent;
  gap: 12px;
`;

export type BrowserToolbarProps = {
  dragControls: any;
  onDragStart: any;
  onDragStop: any;
  zIndex: number;
  windowColor: string;
  showDevToolsToggle: boolean;
  onClose: () => any;
  onMaximize: () => any;
};

export const BrowserToolbar: FC<BrowserToolbarProps> = (
  props: BrowserToolbarProps
) => {
  const {
    showDevToolsToggle,
    dragControls,
    onDragStop,
    onDragStart,
    zIndex,
    windowColor,
    onClose,
    onMaximize,
  } = props;
  const { desktop } = useServices();
  const browserStore = useBrowser();
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  const { iconColor, inputColor } = desktop.theme;

  const { searchForm, searchQuery } = useMemo(
    () =>
      createSearchForm({
        searchUrl: browserStore.currentTab ? browserStore.currentTab?.url : '',
      }),
    [browserStore.currentTab?.url]
  );

  const onKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const term: string = searchForm.actions.submit()['search-query'];
      if (
        term.match(
          /(?:^|\s)((https?:\/\/)?(?:localhost|[\w-]+(?:\.[\w-]+)+)(:\d+)?(\/\S*)?)/
        )
      ) {
        // go to url
        const validUrl = new URL(normalizeUrl(term));
        // console.log(validUrl);
        browserStore.setCurrentTab(normalizeUrl(validUrl.href));
        setUrlData(new URL(normalizeUrl(validUrl.href)));
      } else {
        // search qwant
        const query = new URLSearchParams({ q: term });
        if (term.length > 0) {
          const search = `https://neeva.com/search?q=${query}`;
          browserStore.setCurrentTab(search);
          setUrlData(new URL(normalizeUrl(search)));
        }
      }
      // console.log(searchForm.actions.submit());
    }
  };

  const currentTab = browserStore.currentTab;

  const onBack = () => {
    const webview: any = document.getElementById(
      `${currentTab?.id}-browser-webview`
    );
    webview && webview.goBack();
  };

  const onForward = () => {
    const webview: any = document.getElementById(
      `${currentTab?.id}-browser-webview`
    );
    webview && webview.goForward();
  };

  const onRefresh = useCallback(() => {
    const webview: any = document.getElementById(
      `${currentTab?.id}-browser-webview`
    );
    webview && webview.reload();
  }, [currentTab && currentTab.id]);

  const onDevTools = () => {
    const webview: any = document.getElementById(
      `${currentTab?.id}-browser-webview`
    );
    webview && webview.isDevToolsOpened()
      ? webview.closeDevTools()
      : webview.openDevTools();
  };

  const [loading, setLoading] = useState(false);

  const onStartLoading = () => {
    setLoading(true);
  };

  const onStopLoading = () => {
    setLoading(false);
  };

  const [urlData, setUrlData] = useState<any>(
    currentTab ? new URL(currentTab!.url) : null
  );
  const protocol = urlData ? urlData.protocol.slice(0, -1) : '';

  useEffect(() => {
    const webview: any = document.getElementById(
      `${currentTab?.id}-browser-webview`
    );
    webview?.addEventListener('did-finish-load', () => {
      setCanGoBack(webview.canGoBack());
      setCanGoForward(webview.canGoForward());
      // webview!.openDevTools();
    });
    webview.addEventListener('will-navigate', async (e: any) => {
      const url = new URL(e.url);
      // console.log(url);
      browserStore.setCurrentTab(url.href);
      setUrlData(url);
    });
    webview?.addEventListener('did-start-loading', onStartLoading);
    webview?.addEventListener('did-stop-loading', onStopLoading);
  }, [currentTab.id]);

  const leftIcon = () => {
    if (loading) {
      return (
        <Flex flexDirection="row" alignItems="center">
          <Spinner size={0} />
        </Flex>
      );
    } else {
      return protocol === 'https' ? (
        <Icons name="LockedFill" color="#23B164" />
      ) : (
        <Icons name="UnlockedFill" />
      );
    }
  };

  return useMemo(() => {
    // console.log('in header', protocol);

    return (
      <ToolbarStyle
        hasBlur={false}
        {...(dragControls
          ? {
              onPointerDown: (e) => {
                dragControls.start(e);
                onDragStart && onDragStart(e);
              },
              onPointerUp: (e) => {
                onDragStop && onDragStop(e);
              },
            }
          : {})}
        zIndex={zIndex}
        customBg={windowColor!}
        hasBorder
      >
        <Icons name="AppIconCompass" size="28px" />
        <Flex flexDirection="row" alignItems="center" gap={4}>
          <WindowIcon
            icon="ArrowLeftLine"
            disabled={!canGoBack}
            iconColor={iconColor!}
            bg="#97A3B2"
            onClick={onBack}
          />
          <WindowIcon
            icon="ArrowRightLine"
            disabled={!canGoForward}
            iconColor={iconColor!}
            bg="#97A3B2"
            onClick={onForward}
          />
          <WindowIcon
            icon="Refresh"
            iconColor={iconColor!}
            bg="#97A3B2"
            onClick={onRefresh}
          />
        </Flex>
        <Flex flex={1}>
          <Input
            autoFocus
            tabIndex={0}
            leftIcon={leftIcon()}
            rightIcon={
              <Flex mr={2} flexDirection="row" alignItems="center">
                <Icons name="Search" opacity={0.5} />
              </Flex>
            }
            placeholder="Search Qwant or enter url"
            wrapperStyle={{
              borderRadius: '20px',
              height: 32,
              backgroundColor: inputColor,
            }}
            defaultValue={searchQuery.state.value}
            onKeyPress={onKeyPress}
            error={!searchQuery.computed.isDirty || searchQuery.computed.error}
            onChange={(e: any) => searchQuery.actions.onChange(e.target.value)}
            onFocus={() => searchQuery.actions.onFocus()}
            onBlur={() => searchQuery.actions.onBlur()}
          />
        </Flex>
        <Flex gap={4}>
          {showDevToolsToggle && (
            <WindowIcon
              icon="DevBox"
              iconColor={iconColor!}
              bg="#97A3B2"
              onClick={(evt: any) => {
                evt.stopPropagation();
                onDevTools();
              }}
            />
          )}
          <WindowIcon
            icon="Expand"
            iconColor={iconColor!}
            bg="#97A3B2"
            onClick={(evt: any) => {
              evt.stopPropagation();
              onMaximize && onMaximize();
            }}
          />
          <WindowIcon
            icon="Close"
            iconColor={iconColor!}
            bg="#FF6240"
            fillWithBg
            onClick={(evt: any) => {
              evt.stopPropagation();
              // closeDevTools();
              onClose && onClose();
            }}
          />
        </Flex>
      </ToolbarStyle>
    );
  }, [
    loading,
    zIndex,
    iconColor,
    windowColor,
    searchQuery,
    showDevToolsToggle,
  ]);
};

BrowserToolbar.defaultProps = {
  showDevToolsToggle: true,
};

export const createSearchForm = (
  defaults: any = {
    searchUrl: '',
  }
) => {
  const searchForm = createForm({
    onSubmit({ values }) {
      return values;
    },
  });

  const searchQuery = createField({
    id: 'search-query',
    form: searchForm,
    initialValue: defaults.searchUrl || '',
  });

  return {
    searchForm,
    searchQuery,
  };
};
