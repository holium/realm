import { Instance, types, cast, getSnapshot } from 'mobx-state-tree';
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
    expand() {
      self.expanded = true;
    },
  }));

export type AirliftArmType = Instance<typeof AirliftArm>;

const AirliftAgent = types
  .model('AirliftAgent', {
    arms: types.map(AirliftArm),
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

export const NodeData = types.model('NodeData', {
  value: types.number,
});

enum Position {
  Left = 'left',
  Top = 'top',
  Right = 'right',
  Bottom = 'bottom',
}
const PositionEnum = types.enumeration<Position>(Object.values(Position));

const NodeType = types
  .model('NodeType', {
    id: types.identifier,
    position: types.model({
      x: types.number,
      y: types.number,
    }),
    data: types.optional(types.frozen(), {}), // You can replace "frozen" with the appropriate type for your "data" property.
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
  })
  .actions((self) => ({
    hideAirlift() {
      self.hidden = true;
    },
    showAirlift() {
      self.hidden = false;
    },
  }));

export const FlowStore = types
  .model('FlowStore', {
    nodes: types.array(NodeType),
  })
  .actions((self) => ({
    onNodesChange: (changes: NodeChange[]) => {
      // const newNodes = self.nodes.map((node) => getSnapshot(node)); // create a new copy of each node
      const newNodes = getSnapshot(self.nodes);
      self.nodes = cast(applyNodeChanges(changes, newNodes));
    },
    dropAirlift: (airlift: Node) => {
      // self.nodes = types.array(nodetype).create(self.nodes.concat(airlift));
      self.nodes = cast(self.nodes.concat(airlift));
    },
  }));

export const AirliftStore = types
  .model('AirliftStore', {
    // model: airliftmodel,
    airlifts: types.map(types.map(AirliftModel)),
    flowStore: FlowStore,
  })
  .actions((self) => ({
    //dropAirlift(space: string, type: string, airliftId: string, location: any) {
    dropAirlift(airlift: Node) {
      self.flowStore.dropAirlift(airlift);
      /*const newAirlift = AirliftModel.create({
        airliftId,
        zIndex: self.airlifts.size + 1,
        type,
        bounds: location, //getInitialWindowBounds(app, desktopDimensions),
      });
      if (!self.airlifts.has(space)) {
        self.airlifts.set(space, {});
      }
      self.airlifts.get(space)!.set(airliftId, newAirlift);
      console.log('success');*/
    },
    removeAirlift(space: string, airliftId: string) {
      self.airlifts.get(space)!.delete(airliftId);
    },
    hideAirlift(airliftId: string) {
      // console.log(self.flowStore.nodes);
      const node = self.flowStore.nodes.filter((node) => node.id === airliftId);
      node[0].hideAirlift();
      console.log(node[0].hidden);
    },
  }));

export type AirliftStoreType = Instance<typeof AirliftStore>;
