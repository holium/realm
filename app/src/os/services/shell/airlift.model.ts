import {
  Instance,
  types,
  cast,
  getSnapshot,
  castToSnapshot,
} from 'mobx-state-tree';
import { Node, NodeChange, applyNodeChanges } from 'reactflow';

// Bounds are using the realm.config 1-10 scale.
const BoundsModel = types.model({
  x: types.number,
  y: types.number,
  width: types.maybe(types.number),
  height: types.maybe(types.number),
});

export type BoundsModelType = Instance<typeof BoundsModel>;

const BehnTimerCard = types
  .model('BehnTimerCard', {
    wire: types.string,
    duration: types.string,
  })
  .views((self) => ({
    get code() {
      return (
        '[%pass ' +
        self.wire +
        ' %arvo %b %wait (add now.bowl ' +
        self.duration +
        ')]'
      );
    },
  }));

const AirliftCard = types.union(BehnTimerCard);

export const AirliftArm = types
  .model('AirliftArm', {
    name: types.string,
    body: types.string,
    cards: types.map(AirliftCard),
    expanded: types.boolean,
    view: types.enumeration(['options', 'code', 'cards']),
  })
  .views((self) => ({
    get code() {
      let code = '++  ' + self.name + '\n';
      code += '  |=  vase\n';
      code += '  ^-  (quip card _this)\n';
      code += self.body;
      if (self.cards.size > 0) {
        code += '  :_  this\n';
        code += '  :~  ';
        for (var card in self.cards) {
          code += (card as any).code + '\n';
        }
        code += '  ==\n';
      } else {
        code += '  `this\n';
      }
      return code;
    },
  }))
  .actions((self) => ({
    toggleExpand() {
      self.expanded = !self.expanded;
    },
  }));

export type AirliftArmType = Instance<typeof AirliftArm>;

const AirliftAgent = types
  .model('AirliftAgent', {
    arms: types.map(AirliftArm),
    expanded: types.boolean,
  })
  .views((self) => ({
    get code() {
      let code = `/+  default-agent, dbug
                  |%
                  +$  versioned-state
                    $%  state-0
                        state-1
                    ==
                  +$  state-0  [%0 val=@ud]
                  +$  state-1  [%1 val=[@ud @ud]]
                  +$  card  card:agent:gall
                  --
                  %-  agent:dbug
                  =|  state-1
                  =*  state  -
                  ^-  agent:gall
                  |_  =bowl:gall
                  +*  this  .
                      def   ~(. (default-agent this %.n) bowl)
                  ::
                  `;
      for (var arm in self.arms) {
        code += (arm as any).code;
      }
      code += '--';
      return code;
    },
  }))
  .actions((self) => ({
    toggleExpand() {
      self.expanded = !self.expanded;
    },
  }));

export const AirliftDesk = types.model('AirliftDesk', {
  agents: types.map(AirliftAgent),
});

export const AirliftModel = types.model('AirliftModel', {
  airliftId: types.identifier,
  zIndex: types.number,
  type: types.enumeration(['agent']),
  desks: types.map(AirliftDesk),
  /**
   * The size and position of the window.
   */ bounds: BoundsModel,
  /**
   * The previous size and position of the window.
   * Needed for returning from maximized/fullscreen state.
   */
  prevBounds: types.optional(BoundsModel, {
    x: 1,
    y: 1,
    width: 5,
    height: 5,
  }),
});
export type AirliftModelType = Instance<typeof AirliftModel>;

export function fakeDefault<T>() {
  return undefined as any as T;
}

enum Position {
  Left = 'left',
  Top = 'top',
  Right = 'right',
  Bottom = 'bottom',
}
const PositionEnum = types.enumeration<Position>(Object.values(Position));

export const AirliftData = types
  .model('AirliftData', {
    id: types.identifier,
    name: types.maybe(types.string),
    showDelete: types.boolean,
    agent: AirliftAgent,
  })
  .actions((self) => ({
    setName(name: string) {
      self.name = name;
    },
    promptDelete() {
      self.showDelete = true;
    },
    unpromptDelete() {
      self.showDelete = false;
    },
  }));

export type AirliftDataType = Instance<typeof AirliftData>;

const NodeType = types.model('NodeType', {
  id: types.identifier,
  position: types.model({
    x: types.number,
    y: types.number,
  }),
  data: AirliftData, // You can replace "frozen" with the appropriate type for your "data" property.
  type: types.optional(types.string, ''),
  style: types.maybe(types.frozen()),
  className: types.maybe(types.string),
  sourcePosition: types.maybe(PositionEnum),
  targetPosition: types.maybe(PositionEnum),
  hidden: types.maybe(types.boolean),
  selected: types.maybe(types.boolean),
  dragging: types.maybe(types.boolean),
  draggable: types.maybe(types.boolean),
  selectable: types.maybe(types.boolean),
  connectable: types.maybe(types.boolean),
  deletable: types.maybe(types.boolean),
  dragHandle: types.maybe(types.string),
  width: types.maybeNull(types.number),
  height: types.maybeNull(types.number),
  parentNode: types.maybe(types.string),
  zIndex: types.maybe(types.number),
  extent: types.maybe(types.frozen()),
  expandParent: types.maybe(types.boolean),
  positionAbsolute: types.maybe(
    types.model({
      x: types.number,
      y: types.number,
    })
  ),
  ariaLabel: types.maybe(types.string),
  focusable: types.maybe(types.boolean),
  resizing: types.maybe(types.boolean),
  /*internalsSymbol: types.maybe(
    types.model({
      z: types.maybe(types.number),
      handleBounds: types.maybe(NodeHandleBounds),
      isParent: types.maybe(types.boolean),
    })
  ),*/
});

export type AirliftNodeType = Instance<typeof NodeType>;

export const AirliftStore = types
  .model('AirliftStore', {
    // model: airliftmodel,
    nodes: types.map(types.array(NodeType)),
  })
  .actions((self) => ({
    //dropAirlift(space: string, type: string, airliftId: string, location: any) {
    removeAirlift(space: string, airliftId: string) {
      self.nodes
        .get(space)!
        .remove(self.nodes.get(space)!.find((node) => node.id === airliftId)!);
    },
    promptDelete(space: string, airliftId: string) {
      self.nodes
        .get(space)!
        .find((node) => node.id === airliftId)!
        .data.promptDelete();
    },
    unpromptDelete(space: string, airliftId: string) {
      self.nodes
        .get(space)!
        .find((node) => node.id === airliftId)!
        .data.unpromptDelete();
    },
    onNodesChange: (space: string, changes: NodeChange[]) => {
      const newNodes = getSnapshot(self.nodes.get(space)!);
      const oldNodes = getSnapshot(self.nodes.get(space)!);
      self.nodes.set(space, cast(applyNodeChanges(changes, newNodes)));
      const myNewNodes = getSnapshot(self.nodes.get(space)!);
      console.log(oldNodes === myNewNodes);
    },
    dropAirlift: (space: string, airlift: Node) => {
      console.log('space', space);
      console.log('airlift', airlift);
      if (!self.nodes.has(space)) {
        self.nodes.set(space, []);
      }
      self.nodes.set(
        space,
        castToSnapshot(self.nodes.get(space)!.concat(airlift))
      );
    },
  }));

export type AirliftStoreType = Instance<typeof AirliftStore>;
