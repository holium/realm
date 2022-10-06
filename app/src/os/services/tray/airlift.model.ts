import {
  Instance,
  types,
  cast,
  castToReferenceSnapshot,
  tryReference,
  applySnapshot,
} from 'mobx-state-tree';
import { type } from 'os';

const BehnTimerCard = types
  .model('BehnTimerCard', {
    wire: types.string,
    duration: types.string,
  })
  .views((self) => ({
    get code() {
      return '[%pass ' + self.wire + ' %arvo %b %wait (add now.bowl ' + self.duration + ')]';
    }
  }))

const AirliftCard = types.union(BehnTimerCard);

const AirliftArm = types
  .model('AirliftArm', {
    name: types.string,
    body: types.string,
    cards: types.map(AirliftCard),
    expanded: types.boolean,
    view: types.enumeration(['options', 'code', 'cards'])
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
        code += '  `this\n'
      }
      return code;
    }
  }))
  .actions((self) => ({

  }));

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
                  `
      for (var arm in self.arms) {
        code += (arm as any).code;
      }
      code += '--'
      return code
    }

  }))
  .actions((self) => ({

  }));


const AirliftDesk = types.model('AirliftDesk', {
  agents: types.map(AirliftAgent),
})

const AirliftModel = types
  .model('AirliftModel', {
    desks: types.map(AirliftDesk),
  })

export const AirliftStore = types.model('AirliftStore', {
  model: AirliftModel
});
export type AirliftStoreType = Instance<typeof AirliftStore>;