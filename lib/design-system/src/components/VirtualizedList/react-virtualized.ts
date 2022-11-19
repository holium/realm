import { ComponentProps, FC } from 'react';
import {
  List as ListImport,
  AutoSizer as AutoSizerImport,
  CellMeasurer as CellMeasurerImport,
  CellMeasurerCache as CellMeasurerCacheImport,
} from 'react-virtualized';

export const AutoSizer = AutoSizerImport;
export const CellMeasurerCache = CellMeasurerCacheImport;
export const List = ListImport as any as FC<ComponentProps<typeof ListImport>>;
export const CellMeasurer = CellMeasurerImport as any as FC<
  ComponentProps<typeof CellMeasurerImport>
>;
