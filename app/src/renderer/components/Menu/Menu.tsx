import React from 'react';
import ReactDOM from 'react-dom';

import { Card } from '@holium/design-system/general';

interface IProps {
  id: any;
  preventDefault?: boolean;
  style?: any;
  isOpen: boolean;
  clickableRef?: any;
  customBg?: string;
  children: any;
  onClose: (...args: any) => any;
}

interface IState {
  isOpen?: boolean;
}

//
// Docs:
//    button attribute to prevent close menu: data-prevent-menu-close
//
export class Menu extends React.PureComponent<IProps, IState> {
  menuRef: any;
  static defaultProps = {
    isOpen: false,
    id: Math.random(),
    preventDefault: true,
  };

  constructor(props: any) {
    super(props);

    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.menuRef = React.createRef();
  }

  componentDidMount() {
    document.addEventListener('click', this.handleClickOutside, true);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClickOutside, true);
  }

  handleClickOutside = (event: any) => {
    const { isOpen, onClose, preventDefault } = this.props;

    // eslint-disable-next-line react/no-find-dom-node
    const domNode = ReactDOM.findDOMNode(this.menuRef.current);
    if (!domNode || !domNode.contains(event.target)) {
      // You are clicking outside
      if (isOpen) {
        preventDefault && event.preventDefault();
        onClose();
      }
    } else {
      // You are clicking inside
      // eslint-disable-next-line react/no-find-dom-node
      const clickedNode = ReactDOM.findDOMNode(event.target);
      const preventMenuClose = event.target.getAttribute(
        'data-prevent-menu-close'
      );
      if (
        clickedNode?.nodeName === 'LI' ||
        clickedNode?.nodeName === 'BUTTON'
      ) {
        !preventMenuClose && onClose(event);
      }
    }
  };

  render() {
    const { children, style, isOpen, id } = this.props;
    return (
      <Card
        id={id}
        elevation={2}
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: isOpen ? 1 : 0,
          transition: {
            duration: 0.15,
          },
        }}
        exit={{
          opacity: 0,
          transition: {
            duration: 0.2,
          },
        }}
        ref={(node) => (this.menuRef.current = node)}
        style={{
          display: isOpen ? 'flex' : 'none',
          borderColor: 'rgba(var(--rlm-border-rgba))',
          ...style,
        }}
        role="list"
      >
        {children}
      </Card>
    );
  }
}
Menu.defaultProps = {
  isOpen: false,
  id: Math.random(),
  preventDefault: true,
};
