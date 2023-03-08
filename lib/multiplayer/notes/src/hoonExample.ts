import { schema } from './components/schema';

export const hoonDoc = schema.node('doc', {}, [
  schema.node('paragraph', {}, [
    schema.text('/-  *post, met=metadata-store, hark=hark-graph-hook'),
  ]),
  schema.node('paragraph', {}, [schema.text('/+  graph=graph-store')]),
  schema.node('paragraph', {}, [schema.text('|_  i=indexed-post')]),
  schema.node('paragraph', {}, [schema.text('::')]),
  schema.node('paragraph', {}, [schema.text('++  grow')]),
  schema.node('paragraph', {}, [schema.text('  |%')]),
  schema.node('paragraph', {}, [schema.text('  ++  noun  i')]),
  schema.node('paragraph', {}, [schema.text('  ::')]),
  schema.node('paragraph', {}, [schema.text('  ++  graph-indexed-post')]),
  schema.node('paragraph', {}, [schema.text('    ^-  indexed-post')]),
  schema.node('paragraph', {}, [
    schema.text('    ?>  ?=([@ ~] [@ @ ~]) index.p.i'),
  ]),
  schema.node('paragraph', {}, [
    schema.text('    ?>  (lth i.index.p.i (bex 128))'),
  ]),
  schema.node('paragraph', {}, [schema.text('    i')]),
  schema.node('paragraph', {}, [schema.text('  ::')]),
  schema.node('paragraph', {}, [schema.text('  ++  notification-kind')]),
  schema.node('paragraph', {}, [schema.text('    |=  title=cord')]),
  schema.node('paragraph', {}, [schema.text('    ^-  (unit notif-kind:hark)')]),
  schema.node('paragraph', {}, [schema.text('    ?+  index.p.i  ~')]),
  schema.node('paragraph', {}, [schema.text('        [@ @ ~]')]),
  schema.node('paragraph', {}, [schema.text('      :-  ~')]),
  schema.node('paragraph', {}, [
    schema.text("      :*  ~[text+'New messages from ' ship+author.p.i]"),
  ]),
  schema.node('paragraph', {}, [
    schema.text('          (hark-contents:graph contents.p.i)'),
  ]),
  schema.node('paragraph', {}, [schema.text('          [1 2]  %count  %none')]),
  schema.node('paragraph', {}, [schema.text('      ==')]),
  schema.node('paragraph', {}, [schema.text('    ==')]),
  schema.node('paragraph', {}, [schema.text('  --')]),
  schema.node('paragraph', {}, [schema.text('++  grab')]),
  schema.node('paragraph', {}, [schema.text('  |%')]),
  schema.node('paragraph', {}, [schema.text('  ++  noun  indexed-post')]),
  schema.node('paragraph', {}, [schema.text('  --')]),
  schema.node('paragraph', {}, [schema.text('::')]),
  schema.node('paragraph', {}, [schema.text('++  grad  %noun')]),
  schema.node('paragraph', {}, [schema.text('--')]),
  schema.node('paragraph', {}, []),
]);
