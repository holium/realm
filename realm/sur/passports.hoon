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
::  $friends: specifically used for the our space.
::
+$  friends   (map ship friend)
::
::  $friend: specifically used for the our space, keeps track of another
::    ship and allows metadata.
::
+$  friend-state  ?(%added %mutual)
+$  friend-tags   (set cord)
+$  friend  
  $:  pinned=?
      tags=friend-tags
      mutual=?
  ==  
::
::  $contacts: one-to-one mapping of contact-store to this agent's store
::    contacts are kept in sync and then extended based on needs
::
+$  contacts  (map ship contact:contact-store)
::
::  $passport: track space membership and other metadata
+$  passport
   $:  =roles:membership
       alias=cord
       status=status:membership
   ==
::
::  $passports: passports (access) to spaces within Realm
+$  passports      (map ship passport)
::
::  $districts: subdivisions of the entire realm universe
+$  districts     (map path=space-path:spaces passports)
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
+$  mod
  $%  [%alias alias=@t]
      [%add-roles =roles:membership]
      [%remove-roles =roles:membership]
  ==
+$  payload  (set mod)
::
+$  action
  $%  [%ping msg=(unit @t)]
      [%add path=space-path:spaces =ship =payload]
      [%edit path=space-path:spaces =ship =payload]
      [%remove path=space-path:spaces =ship]
      ::  Our friend actions
      [%add-friend =ship]
      [%edit-friend =ship pinned=? tags=friend-tags]
      [%remove-friend =ship]
      ::  Poke friend actions
      [%be-fren ~]
      [%yes-fren ~]
      [%bye-fren ~]
  ==
::
+$  reaction
  $%  [%friends =friends]
      [%friend =ship =friend]     ::  reacts when on update to existing friend
      [%new-friend =ship =friend] ::  reacts when a new friend is addedd
      [%bye-friend =ship]         ::  reacts when a friend is removed 
  ==
::
::  Scry views
::
+$  view
  $%  [%people =people]
      [%passports =passports]
      [%friends =friends]
  ==
--