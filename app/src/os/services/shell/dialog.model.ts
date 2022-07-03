import React from 'react';

export type DialogId = string;

export type DialogState = {
  [key: string]: {
    required: boolean;
    value: any;
  };
};

export type WorkflowState = {
  // passes in the shared state to each workflow dialog
  [key: string]: {
    required: boolean;
    dialog: DialogId; // specifies which dialog id requires the state to be present
    value: any;
  };
  // you can imagine required data being filled into this shared state as
  // the workflow progresses
};

export interface DialogProps {
  state: DialogState;
}

export interface IDialog {
  id: DialogId;
  component: (props: DialogProps) => React.FC<any>;
  next?: DialogId;
  previous?: DialogId;
  state: DialogState;
}

export interface Workflow {
  flow: IDialog[];
  sharedState: WorkflowState;
}
