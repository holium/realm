::  people [realm]
::
::      @author:  ~lodlev-migdev
::
::  people: feature definitions used by the people agent. the people agent
::    syncs with %contact-store while also providing additional support
::    for Realm integration.
::
/-  resource, contact-store, spaces, membership
|%
::
::  $contacts: one-to-one mapping of contact-store to this agent's store
::    contacts are kept in sync and then extended based on needs
::
+$  contacts  (map ship contact:contact-store)
::
::  $civs: people (civilians) residing in a given space
+$  civs      (map ship [roles:membership alias=cord])
::
::  $zones: subvisions of the entire realm universe
+$  zones     (map path=space-path:spaces civs)
::
::  $person: todo. build out based on further feature development.
::   only add fields here that are "global"; independent of any space
::
+$  person
  $:  last-known-active=(unit @da)
  ==
::
::  $people: mainly used to store "global" metadata (independent of space)
::    for a given person
+$  people    (map ship person)
::
+$  edit-field
  $%  [%alias alias=@t]
  ==
::
+$  action
  :: $%  [%edit path=space-path:spaces =ship payload=edit-field timestamp=@da]
  $%  [%ping msg=(unit @t)]
      [%add path=space-path:spaces =ship =person =roles:membership]
      [%edit path=space-path:spaces =ship payload=edit-field]
      [%remove path=space-path:spaces =ship]
  ==
::
+$  reaction
  $%  [%pong =ship timestamp=@da]
      [%add path=space-path:spaces =ship =person]
      :: [%remove =ship]
      :: [%edit =ship =edit-field timestamp=@da]
  ==
--