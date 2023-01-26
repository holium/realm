import { Children, cloneElement, ReactNode } from 'react';
import styled from 'styled-components';
import { space, SpaceProps } from 'styled-system';

const classnames = (...args: any[]) => args.join(' ');
const getClassName = (el: any) => (el.props && el.props.className) || '';

type Props = {
  children: ReactNode;
  className?: string;
} & SpaceProps;

const StyledChildren = ({ className, children }: Props) => {
  const styledChildren = Children.toArray(children).map((child: any) =>
    cloneElement(child, {
      className: classnames(getClassName(child), className),
    })
  );
  return <>{styledChildren}</>;
};

export const Space = styled(StyledChildren)(space);
