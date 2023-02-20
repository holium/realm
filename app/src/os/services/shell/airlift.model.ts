import { Instance, types } from 'mobx-state-tree';

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
  }))
  .actions((self) => ({}));

export const AirliftDesk = types.model('AirliftDesk', {
  agents: types.map(AirliftAgent),
});

export const AirliftModel = types.model('AirliftModel', {
  airliftId: types.identifier,
  zIndex: types.number,
  type: types.enumeration(['']),
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

export const AirliftStore = types
  .model('AirliftStore', {
    // model: AirliftModel,
    airlifts: types.map(types.map(AirliftModel)),
  })
  .views((self) => ({
    initial(agents: any) {
      /*      self.model = AirliftModel.create({
      })
      const btcWallets = wallets.bitcoin;
      Object.entries(btcWallets).forEach(([key, wallet]) => {
        btcWallets[key] = {
          network: 'bitcoin',
          path: (wallet as any).path,
          nickname: (wallet as any).nickname,
          balance: (wallet as any).balance.toString(),
          address: (wallet as any).address,
          contracts: {}
        }
      })
      applySnapshot(self.wallets, btcWallets);*/
    },
  }))
  .actions((self) => ({
    dropAirlift(
      space: string,
      airliftId: string,
      location: { x: number; y: number }
    ) {
      const newAirlift = AirliftModel.create({
        airliftId,
        zIndex: self.airlifts.size + 1,
        type: '',
        bounds: location, //getInitialWindowBounds(app, desktopDimensions),
      });
      if (!self.airlifts.has(space)) {
        self.airlifts.set(space, {});
      }
      self.airlifts.get(space)!.set(airliftId, newAirlift);
      console.log('success');
    },
    removeAirlift(space: string, airliftId: string) {
      self.airlifts.get(space)!.delete(airliftId);
    },
  }));

export type AirliftStoreType = Instance<typeof AirliftStore>;
