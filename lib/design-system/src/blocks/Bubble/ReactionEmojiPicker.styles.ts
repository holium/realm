import styled from 'styled-components';

import { Flex } from '../../general/Flex/Flex';

export const ReactionEmojiPickerStyle = styled(Flex)`
  .EmojiPickerReact {
    --epr-category-label-height: 22px;
    --epr-category-navigation-button-size: 24px;
    --epr-emoji-size: 24px;
    --epr-search-input-height: 34px;
    font-size: 12px;
  }

  .epr-header-overlay {
    padding: 8px !important;
  }
  .epr-skin-tones {
    padding-left: 0px !important;
    padding-right: 2px !important;
  }
  .epr-category-nav {
    padding: 0px 8px !important;
    padding-bottom: 4px !important;
    --epr-category-navigation-button-size: 24px;
  }
  .ul.epr-emoji-list {
    padding-bottom: 8px !important;
  }
  .epr-category-nav > button.epr-cat-btn:focus:before {
    top: -3px;
    left: -3px;
    right: -3px;
    bottom: -3px;
  }
`;
