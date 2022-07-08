/-  store=people, contact-store
/+  default-agent, resource, action-agent, people-store
|%
+$  card  card:agent:gall
+$  versioned-state
    $%  state-0
    ==
+$  state-0
  $:  %0
      =spaces:store
      =people:store
      =contacts:store
      allowed-groups=(set resource)
      allowed-ships=(set ship)
      is-public=_|
  ==
--
=|  state-0
=*  state  -
%-  agent:action-agent
^-  agent:gall
=<
  |_  =bowl:gall
  +*  this  .
      def   ~(. (default-agent this %.n) bowl)
  ::
  ++  on-init  :: on-init:def
    ^-  (quip card _this)
    :_  this
    ::  %watch: get the initial contact list and watch for updates
    :~  [%pass /contacts %agent [our.bowl %contact-store] %watch /all]
    ==
  ::
  ++  on-save  ::on-save:def
    ^-  vase
    !>(state)
  ::
  ++  on-load  ::on-load:def
    |=  old-state=vase
    ^-  (quip card:agent:gall agent:gall)
    =/  old  !<(versioned-state old-state)
    ?-  -.old
      %0  `this(state old)
    ==
  ::
  ++  on-poke
    |=  [=mark =vase]
    ^-  (quip card _this)
    ~&  >>  "{<dap.bowl>}: on-poke"
    =^  cards  state
    ?+  mark  (on-poke:def mark vase)
      %people-action  (act !<(action:store vase))
      %test-mark
        %-  (slog leaf+"{<dap.bowl>}: received {<mark>}, {<vase>}" ~)
        =/  person=person:store  [%owner %czar now.bowl]
        =+  data=[%add %my-space our.bowl person]
        %-  (slog leaf+"{<dap.bowl>}: building tube" ~)
        =/  home=path  /(scot %p our.bowl)/realm/(scot %da now.bowl)
        =/  js-tube  .^(tube:clay %cc (weld home /person/json))
        %-  (slog leaf+"{<dap.bowl>}: tube built" ~)
        =/  result  !<(json (js-tube !>(data)))
        ~&  >  (en-json:html result)
        `state
    ==
    [cards this]

    ::   %update
    ::     =^  cards  state
    ::     =/  update  !<(update )
    ::       (add-person !<(person vase))
    ::     [cards this]
    ::   %add-person
    ::     =^  cards  state
    ::       (add-person !<(person vase))
    ::     [cards this]
    ::   %edit-person
    ::     =^  cards  state
    ::       (edit-person !<(person vase))
    ::     [cards this]
    ::   %edit-person-field
    ::     =^  cards  state
    ::       !<(edit-person-field vase)
    ::       (handle-edit-person-field !<(edit-field vase))
    ::     [cards this]
    ::   %delete-person
    ::     =^  cards  state
    ::       (delete-person !<(person vase))
    ::     [cards this]
    :: ==
  ::
  ++  on-leave  on-leave:def
  ::
  ++  on-watch  on-watch:def
  ::
  ++  on-peek
    |=  =path
    ^-  (unit (unit cage))
    ?+  path  (on-peek:def path)
      [%x %dbug %state ~]
        ~&  >  "[app-agent state]"
        ``noun+!>(contacts.state)
    ==
  ::
  ++  on-agent
    |=  [=wire =sign:agent:gall]
    ^-  (quip card _this)
    =/  wirepath  `path`wire
    ?+    wire  (on-agent:def wire sign)
      :: handle updates coming in from group store
      [%contacts ~]
        ?+    -.sign  (on-agent:def wire sign)
          %watch-ack
            ?~  p.sign  `this
            ~&  >>>  "{<dap.bowl>}: contact-store subscription failed"
            `this
      ::
          %kick
            ~&  >  "{<dap.bowl>}: contact-store kicked us, resubscribing..."
            :_  this
            :~  [%pass /group %agent [our.bowl %group-store] %watch /groups]
            ==
      ::
          %fact
            ?+    p.cage.sign  (on-agent:def wire sign)
                %contact-update-0
                  =/  action  !<(=update:contact-store q.cage.sign)
                  %-  (slog leaf+"{<dap.bowl>}: received contact update {<action>}..." ~)
                  ?+  -.action  (on-agent:def wire sign)
                    ::  initial update is sent when first subscribing to the contact store.
                    ::    this action includes all of this ship's contacts. take this opportunity
                    ::    to retrieve the full contact list
                    ::
                    %initial
                      =^  cards  state
                        (on-contacts-initial action)
                      [cards this]
                    ::
                    %edit
                      =^  cards  state
                        (on-contact-edit action)
                      [cards this]
                    ::
                    %set-public
                      =^  cards  state
                        (on-contact-set-public action)
                      [cards this]
                    ::
                    %disallow
                      =^  cards  state
                        (on-contact-disallow action)
                      [cards this]
                    ::
                    %allow
                      =^  cards  state
                        (on-contact-allow action)
                      [cards this]
                  ==
            ==
        ==
    ==
  ::
  ++  on-arvo  on-arvo:def
  ::
  ++  on-fail   on-fail:def
  --
|_  =bowl:gall
++  act
  |=  =action:store
  ^-  (quip card _state)
  ?-  -.action
    %add         (handle-add +.action)
    %remove      (handle-remove +.action)
    %edit        (handle-edit +.action)
  ==
::
::  $handle-add: add a new person to the person store, while
::    also adding a new space entry to track ship/role relationships
++  handle-add
  |=  [space=@t =ship =person:store]
  ^-  (quip card _state)
  ::  ensure difference
  =/  old=(unit person:store)  (~(get by people) ship)
  ?.  ?|  ?=(~ old)
          !=(person(last-updated *@da) u.old(last-updated *@da))
      ==
    [~ state]
  =/  meta=metaspace:store   [ship role.person]
  =/  metas  (~(got by spaces) space)
  =/  metas  (~(put in metas) meta)
  :_  state(spaces (~(put by spaces) space metas), people (~(put by people) ship person))
  :~  [%give %fact [/updates ~] %person-action !>([%add ship person])]
  ==
::
++  handle-remove
  |=  [space=@t =ship]
  ^-  (quip card _state)
  `state
::
++  handle-edit
  |=  [space=@t =ship edit=edit-field:store timestamp=@da]
  ^-  (quip card _state)
  `state
:: ::
:: ::  $add-person: add a new person to the person store. generate
:: ::    an error if the person already exists
:: ::
:: ++  add-person
::   |=  =person
::   ^-  (quip card _state)
::   =/  item  (~(get by people.state) ship.person)
::   ?.  =(item ~)  (give-error (crip "{<ship.person>} exists"))
::   `state(people (~(put by people.state) ship.person person)
:: ::
:: ::  $edit-person: modify an entire person in the people store
:: ::
:: ++  edit-person
::   |=  =person
::   ^-  (quip card _state)
::   =/  item  (~(get by people.state) ship.person)
::   ?:  =(item ~)  (give-error (crip "{<ship.person>} not found"))
::   `state(people (~(put by people.state) ship.person person))
:: ::
:: ::  $edit-person: modify an entire person in the people store
:: ::
:: ++  edit-person-bulk
::   |=  =ship edits=edit-bulk
::   ^-  person
::   =/  item  (~(get by people.state) ship)
::   ?:  =(item ~)  (give-error (crip "{<ship.person>} not found"))
::   %-  ~(rep in edits)
::     |=  [=edit-field @]
::     (edit-person-field edit-field)
::   `state(people (~(put by people.state) ship.person person))
:: ::
:: ::  $edit-person-field: modify an individual person field
:: ::
:: ++  edit-person-field
::   |=  =person edit=edit-field
::   ^-  person
::   ?-  -.edit
::     %rank  person(rank rank.edit)
::   ==
:: ::
:: ::  $handle-edit-person-field: wraps person modification with update to state
:: ::
:: ++  handle-edit-person-field
::   |=  =ship edit=edit-field
::   ^-  (quip card _state)
::   =/  person  (~(get by people.state) ship)
::   ?:  =(item ~)  (give-error (crip "{<ship.person>} not found"))
::   =/  person  (edit-person-field person edit)
::   `state(people (~(put by people.state) ship.person ))
::
::  $on-contacts-initial: imports initial contact list
::    from %contact-store when the agent starts
::
++  on-contacts-initial
  |=  [=update:contact-store]
  ?>  ?=(%initial -.update)
  %-  (slog leaf+"{<dap.bowl>}: received contact initial {<rolodex.update>}..." ~)
  ::  stuff all contacts under the %contact key in state
  `state(contacts (~(gas by contacts.state) ~(tap by rolodex.update)))
::
++  on-contact-edit
  |=  [=update:contact-store]
  ?>  ?=(%edit -.update)
  %-  (slog leaf+"{<dap.bowl>}: received contact edit {<edit-field.update>}..." ~)
  =/  edit  edit-field.update
  =/  person  (~(got by contacts.state) ship.update)
  =/  updated-person
  ?-  -.edit
    %nickname  person(nickname nickname.edit)
    %bio       person(bio bio.edit)
    %status    person(status status.edit)
    %color     person(color color.edit)
    %avatar    person(avatar avatar.edit)
    %cover     person(cover cover.edit)
  ::
      %add-group
    person(groups (~(put in groups.person) resource.edit))
  ::
      %remove-group
    person(groups (~(del in groups.person) resource.edit))
  ==
  `state(contacts (~(put by contacts.state) ship.update updated-person))
::
++  on-contact-set-public
  |=  [=update:contact-store]
  ?>  ?=(%set-public -.update)
  %-  (slog leaf+"{<dap.bowl>}: received contact set-public {<public.update>}..." ~)
  ::  realm's is-public flag is sync'd with the contact app's public flag
  `state(is-public public.update)
::
++  on-contact-disallow
  |=  [=update:contact-store]
  ?>  ?=(%disallow -.update)
  ::  beings management is sync'd with contact apps beings management
  %-  (slog leaf+"{<dap.bowl>}: received contact disallow {<update>}..." ~)
  =/  =beings:contact-store  +.update
  ?-  -.beings
    %group  `state(allowed-groups (~(del in allowed-groups) resource.beings))
    %ships  `state(allowed-ships (~(dif in allowed-ships) ships.beings))
  ==
::
++  on-contact-allow
  |=  [=update:contact-store]
  ?>  ?=(%allow -.update)
  %-  (slog leaf+"{<dap.bowl>}: received contact allow {<update>}..." ~)
  ::  beings management is sync'd with contact apps beings management
  =/  =beings:contact-store  +.update
  ?-  -.beings
    %group  `state(allowed-groups (~(del in allowed-groups) resource.beings))
    %ships  `state(allowed-ships (~(dif in allowed-ships) ships.beings))
  ==
--