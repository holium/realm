/-  *group, group-store, act, *people
/+  store=group-store, default-agent, resource, action-agent
|%
+$  card  card:agent:gall
+$  versioned-state
    $%  state-0
    ==
+$  state-0
  $:  %0
      =spaces
      =people
      =contacts
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
  ++  on-poke  on-poke:def
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