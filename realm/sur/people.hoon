::  @author:  ~lodlev-migdev
::  people: feature definitions used by the people agent. the people agent
::    syncs with %contact-store while also providing additional support
::    for Realm integration.
::
/-  contact-store
|%
::
::  $role - user roles which drive Realm permissioning
::
+$  role  ?(%owner %admin %member %initiate)
::
::  $rank - user rank (exploratory)
::
:: +$  rank  ?(%duke %null)
::  $metaspace - selective aspects of a broader space used for
::    efficiency purposes
+$  metaspace
  $:  =ship
      =role
  ==
+$  spaces  (map @t (set metaspace))
::
::  $contacts: one-to-one mapping of contact-store to this agent's store
::    contacts are kept in sync and then extended based on needs
::
+$  contacts  (map ship contact:contact-store)
::
::  $person: todo. build out based on further feature development
::
+$  person
  $:  =rank:title
      last-updated=@da
  ==
::
+$  edit-field
  $%  [%rank =rank:title]
  ==
::
+$  edit-person-field
  $:  =person
      =edit-field
  ==
::
+$  edit-bulk  (set edit-field)
::
+$  people  (map ship person)
::
+$  update
  $%  [%add =ship =person]
      [%remove =ship]
      [%edit =ship =edit-field timestamp=@da]
  ==
--