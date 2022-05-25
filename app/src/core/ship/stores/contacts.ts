import { toJS } from 'mobx';
import { flow, Instance, types } from 'mobx-state-tree';
import { cleanNounColor } from '../../../renderer/logic/utils/color';

// const Reactions = types.model({
//   likes: types.number,
//   replies: types.reference()
// });

export const ContactModel = types.model('ContactModel', {
  avatar: types.maybeNull(types.string),
  bio: types.maybeNull(types.string),
  color: types.maybeNull(types.string),
  cover: types.maybeNull(types.string),
  groups: types.array(types.string),
  'last-updated': types.number,
  nickname: types.maybeNull(types.string),
  status: types.maybeNull(types.string),
});

export type ContactModelType = Instance<typeof ContactModel>;

export const ContactStore = types
  .model('ContactStore', {
    ourPatp: types.string,
    rolodex: types.map(ContactModel),
  })
  .views((self) => ({
    get our() {
      return self.rolodex.get(self.ourPatp);
    },
  }))
  .actions((self) => ({
    // getContact: (ship:string) => {

    // },
    // TODO make a handler for all contact updates
    setInitial(json: {
      'contact-update': {
        initial?: {
          'is-public': boolean;
          rolodex: { [patp: string]: ContactModelType };
        };
        edit?: any;
      };
    }) {
      // ------------------
      // ---- initial -----
      // ------------------
      if (json['contact-update'].initial) {
        const contactMap = new Map<string, ContactModelType>();
        const contacts = json['contact-update'].initial.rolodex;
        // console.log(contacts);
        Object.keys(contacts).forEach((patp: string) => {
          const newContact: ContactModelType = contacts[patp];
          contactMap.set(patp, {
            ...newContact,
            color: newContact.color && cleanNounColor(newContact.color),
          });
        });
        self.rolodex.merge(contactMap);
        // console.log(toJS(self.rolodex.get('~lomder-librun')));
      }
      // ------------------
      // ------ edit ------
      // ------------------
      if (json['contact-update'].edit) {
        console.log('edit... ', toJS(json['contact-update'].edit));
      }
    },
  }));

// avatar: null
// bio: ""
// color: "0x0"
// cover: null
// groups: ["/ship/~locdys-hablys/nietzsche-discussion"]
// last-updated: 946684800000
// nickname: ""
// status: ""
