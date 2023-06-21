import React from 'react';

import { Button, Flex } from '@holium/design-system/general';

import { TabItem } from '../types';

interface TabsProps {
  value: number;
  tabData: TabItem[];
  onChange: (value: number) => void;
}
export const Tabs = ({ value, tabData, onChange }: TabsProps) => {
  return (
    <Flex
      gap={10}
      style={{ borderBottom: '1px solid rgba(var(--rlm-text-rgba), 0.12)' }}
      marginBottom={16}
    >
      {tabData.map((item: TabItem, index: number) => {
        return (
          <Button.Minimal
            className="tab-element"
            key={index}
            fontSize={1}
            fontWeight={item.value === value ? 500 : 400}
            style={{
              padding: '2px 0px',
              borderRadius: 0,
              backgroundColor: 'transparent',
              color:
                item.value === value
                  ? 'rgba(var(--rlm-accent-rgba))'
                  : 'rgba(var(--rlm-text-rgba), 0.5)',
              borderBottom:
                item.value === value
                  ? '2px solid rgba(var(--rlm-accent-rgba))'
                  : '2px solid transparent',
            }}
            onClick={() => {
              onChange(item.value);
            }}
          >
            {item.label}
          </Button.Minimal>
        );
      })}
    </Flex>
  );
};
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  other: any;
}
export const TabPanel = ({
  children,
  value,
  index,
  ...other
}: TabPanelProps) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      style={{
        display: value !== index ? 'none' : 'flex',
        flexDirection: 'column',
        flex: 1,
      }}
      {...other}
    >
      {children}
    </div>
  );
};
