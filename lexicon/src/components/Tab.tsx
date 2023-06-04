import React from 'react';
import {
  Button,
  Icon,
  Card,
  Flex,
  Text,
  TextInput,
  Menu,
} from '@holium/design-system';
import { TabItem } from '../types';


function Tabs({
  value,
  tabData,
  onChange,
}: {
  value: number;
  tabData: TabItem[];
  onChange: Function;
}) {
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
            fontWeight={item.value === value ? 600 : 400}
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
}
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {children}
    </div>
  );
}

export { Tabs, TabPanel };
