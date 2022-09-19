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
  ==
::
+$  reaction
  $%  [%all =districts]
      [%members path=space-path:spaces =passports]
      [%new-members path=space-path:spaces =passports]
  ==
::
::  Scry views
::
+$  view
  $%  [%people =people]
      [%members =passports]
      [%member =passport]
      [%districts =districts]
      [%is-member is-member=?]
  ==
--