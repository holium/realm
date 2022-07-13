/-  store=people, contact-store, spaces
/+  dbug, default-agent, resource, people-store
|%
+$  card  card:agent:gall
+$  versioned-state
    $%  state-0
    ==
+$  state-0
  $:  %0
      =metaspaces:store
      =people:store
      =contacts:store
      allowed-groups=(set resource)
      allowed-ships=(set ship)
      is-public=_|
  ==
--
=|  state-0
=*  state  -
%-  agent:dbug
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
        :: watch spaces to get notifications when people related areas
        ::   of spaces change (e.g. create, edit, remove)
        [%pass /spaces %agent [our.bowl %spaces] %watch /updates]
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
    ~&  >>  "{<dap.bowl>}: on-poke {<mark>}, {<vase>}"
    =^  cards  state
    ?+  mark  (on-poke:def mark vase)
      %people-action  (act !<(action:store vase))
    ==
    [cards this]
  ::
  ++  on-leave  on-leave:def
  ::
  ++  on-watch  on-watch:def
  ::
  ++  on-peek
    |=  =path
    ^-  (unit (unit cage))
    (on-peek:def path)
    :: ?+  path  (on-peek:def path)
      :: [%x %dbug %state ~]
      ::   ~&  >  "[app-agent state]"
      ::   ``noun+!>(contacts.state)
    :: ==
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
            :~  [%pass /contacts %agent [our.bowl %contact-store] %watch /all]
            ==
      ::
          %fact
            ?+    p.cage.sign  (on-agent:def wire sign)
                %contact-update-0
                  =/  action  !<(=update:contact-store q.cage.sign)
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

      [%spaces ~]
        ?+    -.sign  (on-agent:def wire sign)
          %watch-ack
            ?~  p.sign  `this
            ~&  >>>  "{<dap.bowl>}: spaces subscription failed"
            `this
      ::
          %kick
            ~&  >  "{<dap.bowl>}: spaces kicked us, resubscribing..."
            :_  this
            :~  [%pass /spaces %agent [our.bowl %spaces] %watch /updates]
            ==
      ::
          %fact
            ?+    p.cage.sign  (on-agent:def wire sign)
                %spaces-reaction
                  =/  action  !<(=reaction:spaces q.cage.sign)
                  =^  cards  state
                  ?-  -.action :: (on-agent:def wire sign)
                    %initial  (on-spaces-initial action)
                    %add      (on-spaces-add action)
                    %replace  (on-spaces-replace action)
                    %remove   (on-spaces-remove action)
                  ==
                  [cards this]
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
  |=  [=ship =person:store]
  ^-  (quip card _state)
  ~&  >  "{<dap.bowl>}: handle-add {<ship>}, {<person>}"
  ::  ensure difference
  :: =/  old=(unit person:store)  (~(get by people) ship)
  :: ?.  ?|  ?=(~ old)
  ::         !=(person(last-updated.contact *@da) u.old(last-updated.contact *@da))
  ::     ==
  ::   [~ state]
  :: =/  meta=metaspace:store   [ship role.person]
  :: =/  metas  (~(got by spaces) space)
  :: =/  metas  (~(put in metas) meta)
  :: :_  state(spaces (~(put by spaces) space metas), people (~(put by people) ship person))
  :_  state(people (~(put by people) ship person))
  :~  [%give %fact [/updates ~] %people-action !>([%add ship person])]
  ==
::
++  handle-remove
  |=  [=ship]
  ^-  (quip card _state)
  `state
::
++  handle-edit
  |=  [=ship edit=edit-field:store timestamp=@da]
  ^-  (quip card _state)
  `state
::
::  $on-contacts-initial: imports initial contact list
::    from %contact-store when the agent starts
::
++  on-contacts-initial
  |=  [=update:contact-store]
  ?>  ?=(%initial -.update)
  ::  stuff all contacts under the %contact key in state
  `state(contacts (~(gas by contacts.state) ~(tap by rolodex.update)))
::
++  on-contact-edit
  |=  [=update:contact-store]
  ?>  ?=(%edit -.update)
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
  ::  realm's is-public flag is sync'd with the contact app's public flag
  `state(is-public public.update)
::
++  on-contact-disallow
  |=  [=update:contact-store]
  ?>  ?=(%disallow -.update)
  ::  beings management is sync'd with contact apps beings management
  =/  =beings:contact-store  +.update
  ?-  -.beings
    %group  `state(allowed-groups (~(del in allowed-groups) resource.beings))
    %ships  `state(allowed-ships (~(dif in allowed-ships) ships.beings))
  ==
::
++  on-contact-allow
  |=  [=update:contact-store]
  ?>  ?=(%allow -.update)
  ::  beings management is sync'd with contact apps beings management
  =/  =beings:contact-store  +.update
  ?-  -.beings
    %group  `state(allowed-groups (~(del in allowed-groups) resource.beings))
    %ships  `state(allowed-ships (~(dif in allowed-ships) ships.beings))
  ==
::
++  on-spaces-initial
  |=  [=reaction:spaces]
  ^-  (quip card _state)
  ?>  ?=(%initial -.reaction)
  `state
::
++  on-spaces-add
  |=  [=reaction:spaces]
  ^-  (quip card _state)
  ?>  ?=(%add -.reaction)
  `state
::
++  on-spaces-replace
  |=  [=reaction:spaces]
  ^-  (quip card _state)
  ?>  ?=(%replace -.reaction)
  `state
::
++  on-spaces-remove
  |=  [=reaction:spaces]
  ^-  (quip card _state)
  ?>  ?=(%remove -.reaction)
  `state
--