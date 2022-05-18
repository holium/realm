import React from 'react';
import styled from 'styled-components';
import { compose, space, color, layout, typography } from 'styled-system';
import useContextMenu from './useContextMenu';
import { MenuItem } from '../MenuItem';

export const ContextMenuStyles = styled(styled.ul`
  font-size: 14px;
  padding: 5px 0 5px 0;
  width: 150px;
  height: auto;
  z-index: 5000 !important;
  margin: 0;
  position: absolute;
  list-style: none;
  pointer-events: none;
  overflow: visible !important;
  cursor: pointer;
  color: ${(props) => props.theme.colors.text.primary};
  transition: ${(props) => props.theme.transitionFast};
  background-color: ${(props) => props.theme.colors.bg.secondary};
  border: 1px solid ${(props) => props.theme.colors.ui.input.borderColor};
  box-sizing: border-box;
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(70px);
  border-radius: ${(props) => props.theme.containers.outerBorderRadius}px;
  hr {
    height: 1px;
    background-color: ${(props) => props.theme.colors.bg.divider};
    border: none;
    width: 80%;
    border-radius: 50%;
    margin-block-end: 0.35em;
    margin-block-start: 0.35em;
  }
`)({}, compose(space, color, layout, typography));

export type ContextMenuProps = {
  containerId: string;
  parentRef: any;
  menuItemtype?: 'neutral' | 'brand';
  menu: any[];
};

export const ContextMenu = (props: ContextMenuProps) => {
  const { containerId, parentRef, menu, menuItemtype } = props;
  const contextMenuRef = React.useRef();
  const { anchorPoint, show } = useContextMenu(
    containerId,
    parentRef,
    contextMenuRef
  );

  const sectionsArray = menu.reduce((arr, obj: any, index: number) => {
    if (!index || arr[arr.length - 1][0].section !== obj.section) {
      return arr.concat([
        [<MenuItem type={menuItemtype} key={index} {...obj} />],
      ]);
    }
    arr[arr.length - 1].push(
      <MenuItem type={menuItemtype} key={index} {...obj} />
    );
    return arr;
  }, []);

  // if (show) {
  return (
    <ContextMenuStyles
      id={`${containerId}-context-menu`}
      className="menu"
      // @ts-ignore
      ref={contextMenuRef}
      style={{
        top: anchorPoint.y,
        left: anchorPoint.x,
        display: show ? 'block' : 'none',
      }}
    >
      {sectionsArray.map((menuSection: any[], index: number) => {
        let divider = <hr />;
        if (index === sectionsArray.length - 1) {
          // @ts-ignore
          divider = undefined;
        }
        return (
          <section key={`section-${index}`}>
            {menuSection}
            {divider}
          </section>
        );
      })}
    </ContextMenuStyles>
  );
  // }
  // return <></>;
};

ContextMenu.defaultProps = {
  menuItemtype: 'neutral',
};

export default ContextMenu;
// With animation test
// <Spring
//   config={{ duration: 10 }}
//   from={{ opacity: 0, x: anchorPoint.x + 10, y: anchorPoint.y + 10 }}
//   to={{ opacity: 1, x: anchorPoint.x, y: anchorPoint.y }}
// >
//   {(springProps: any) => (
//     <ContextMenuStyles
//       id={`${containerId}-context-menu`}
//       className="menu"
//       ref={contextMenuRef}
//       style={{ top: springProps.y, left: springProps.x }}
//     >
//       {sectionsArray.map((menuSection: any[], index: number) => {
//         let divider = <hr />;
//         if (index === sectionsArray.length - 1) {
//           divider = undefined;
//         }
//         return (
//           <div key={`section-${index}`}>
//             {menuSection}
//             {divider}
//           </div>
//         );
//       })}
//     </ContextMenuStyles>
//   )}
// </Spring>;
