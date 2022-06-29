/-  *group, group-store, act, *people
/+  store=group-store, default-agent, resource, action-agent
|%
+$  card  card:agent:gall
+$  versioned-state
    $%  state-0
    ==
+$  state-0  [%0 contacts=rolodex:contact-store]
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
  ++  on-peek  on-peek:def
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
                  ?+  -.action  (on-agent:def wire sign)
                    %initial
                      =^  cards  state
                        (on-contacts-initial action)
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
  ::  stuff all contacts under the %contact key in state
  :_  state(contacts (~(gas by contacts.state) ~(tap by rolodex.update)))
  ::  no effects
  [~]
--