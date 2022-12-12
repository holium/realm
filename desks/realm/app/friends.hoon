::  friends [realm]:
::
::  Friend list management within Realm
::
/-  store=friends, membership-store=membership
/+  dbug, default-agent, lib=friends
|%
+$  card  card:agent:gall
+$  versioned-state  $%(state-0)
+$  state-0  [%0 is-public=? =friends:store]
--
=|  state-0
=*  state  -
%-  agent:dbug
^-  agent:gall
=<
  |_  =bowl:gall
  +*  this  .
      def   ~(. (default-agent this %.n) bowl)
      core  ~(. +> [bowl ~])
      cc    |=(cards=(list card) ~(. +> [bowl cards]))
  ::
  ++  on-init
    ^-  (quip card _this)
    =^  cards  state
      ?.  has-pals:core  `state
      =.  friends  pals-friends:core
      abet:(add-frens:core ~(tap in ~(key by pals-following:core)))
    ::
    ?.  has-contact-store:core  [cards this]
    :_  this(friends (rolodex-to-friends:lib friends rolodex:core))
    %+  welp  cards
    [%pass /contacts %agent [our.bowl %contact-store] %watch /all]~
  ::
  ++  on-save
    ^-  vase
    !>(state)
  ::
  ++  on-load
    |=  =vase
    ^-  (quip card:agent:gall agent:gall)
    =/  old=(unit state-0)
      (mole |.(!<(state-0 vase)))  
    ?^  old
      `this(state u.old)
    :: temporarily doing this for making development easier
    ~&  >>  'nuking old %friends'
    =^  cards  this  on-init
    :_  this
    =-  (welp - cards)
    %+  turn  ~(tap in ~(key by wex.bowl))
    |=  [=wire =ship =term] 
    ^-  card
    [%pass wire %agent [ship term] %leave ~]
  :: |=  old-state=vase
  :: ^-  (quip card _this)
  :: =/  old  !<(versioned-state old-state)
  :: ?-  -.old
  ::   %0  `this(state old)
  :: ==
  ::
  ++  on-poke
    |=  [=mark =vase]
    ^-  (quip card _this)
    =^  cards  state
    ?+  mark  (on-poke:def mark vase)
      %friends-action    (action:core !<(action:store vase))
    ==
    [cards this]
  ::
  ++  on-watch
    |=  =path
    ^-  (quip card _this)
    =/  cards=(list card)
      ?+    path      (on-watch:def path)
          [%all ~]
        ::  only host should get all updates
        ?>  =(our.bowl src.bowl)
        =;  cage
          [%give %fact ~[/all] cage]~
        friends-reaction+!>([%friends (non-contacts:core friends)])
      ==
    [cards this]
  ::
  ++  on-peek
    |=  =path
    ^-  (unit (unit cage))
    ?+    path  (on-peek:def path)
        [%x %all ~] :: ~/scry/friends/all.json
      ?>  (team:title our.bowl src.bowl)
      ``noun+!>((view:enjs:lib [%friends (non-contacts:core friends)]))
      ::
        [%x %ships ~]
      ?>  =(our.bowl src.bowl)
      ``noun+!>(~(key by (non-contacts:core friends)))
    ==
  ::
  ++  on-agent
  |=  [=wire =sign:agent:gall]
  ^-  (quip card _this)
  ?+    wire  (on-agent:def wire sign)
      [%contacts ~]
    ?+    -.sign  (on-agent:def wire sign)
        %watch-ack
      ?~  p.sign  
      %.  `this
      (slog leaf+"{<dap.bowl>}: subscribed to %contact-store /all" ~)
      ~&  >>>  "{<dap.bowl>}: subscription to %contact-store /all failed"
      `this
        %kick
      ~&  >  "{<dap.bowl>}: kicked, resubscribing..."
      :_  this
      [%pass /contacts %agent [our.bowl %contact-store] %watch /all]~
        %fact
      ?.  =(p.cage.sign %contact-update-0)  (on-agent:def wire sign)
      =/  upd  !<(update:store q.cage.sign)
      ?+    -.upd  `this
          %initial
        `this(friends (rolodex-to-friends:lib friends rolodex.upd))
          %add
        =/  ufren  (~(get by friends) ship.upd)
        =/  fren  (contact-to-friend:lib ufren contact.upd)
        `this(friends (~(put by friends) ship.upd fren))
          %remove
        =/  ufren  (~(get by friends) ship.upd)
        ?~  ufren=(~(get by friends) ship.upd)  `this
        ?:  =(%contact status.u.ufren)
          `this(friends (~(del by friends) ship.upd))
        =/  fren  (purge-contact-info:lib u.ufren)
        `this(friends (~(put by friends) ship.upd fren))
          %edit
        =/  fren
          (field-edit:lib (~(got by friends) ship.upd) edit-field.upd)
        `this(friends (~(put by friends) ship.upd fren))
      ==
    ==
  ==
  ::
  ++  on-leave    on-leave:def
  ++  on-arvo     on-arvo:def
  ++  on-fail     on-fail:def
  --
|_  [=bowl:gall cards=(list card)]
++  core  .
++  abet  [(flop cards) state]
++  emit  |=(=card core(cards [card cards]))
++  emil  |=(new-cards=(list card) core(cards (weld new-cards cards)))
++  action
  |=  =action:store
  ^-  (quip card _state)
  ?-  -.action
    %add-friend     abet:(add-fren +.action)
    %edit-friend    abet:(edit-fren +.action)
    %remove-friend  abet:(remove-fren +.action)
    %be-fren        abet:(be-fren src.bowl)
    %yes-fren       abet:(yes-fren src.bowl)
    %bye-fren       abet:(bye-fren src.bowl)
  ==
::
++  add-fren
  |=  =ship
  ^-  _core
  |^
  ?>  =(our.bowl src.bowl)
  ~&  >  ['adding friend' ship]
  =/  ufren  (~(get by friends) ship)
  :: If fren is in friends
  ?.  ?=(~ ufren)
    =/  status  ?:(=(%follower status.u.ufren) %fren %following)
    =/  fren  u.ufren(status status)
    =.  friends  (~(put by friends) ship fren)
    =.  core
      :: If fren is follower, confirm new frenship
      ?.  =(%follower status.u.ufren)  core
      %-  emit
      =/  dock  [ship dap.bowl]
      =/  cage  friends-action+!>([%yes-fren ~])
      [%pass / %agent dock %poke cage]
    %-  emit
    [%give %fact ~[/all] friends-reaction+!>([%new-friend ship fren])]
  :: If the fren is not added yet
  =/  fren     [.(status %following)]:*friend:store
  =.  friends  (~(put by friends) ship fren)
  %-  emil
  %+  welp  contact-cards
  :~  =/  dock  [ship dap.bowl]
      =/  cage  friends-action+!>([%be-fren ~])
      [%pass / %agent dock %poke cage]
      [%give %fact ~[/all] friends-reaction+!>([%new-friend ship fren])]
  ==
  ++  contact-cards
    ^-  (list card)
    %+  welp
      :: allow ship to view our contact info
      ?:  contact-is-public:core  ~
      =/  dock  [our.bowl %contact-store]
      =/  ships  (~(put in *(set ^ship)) ship)
      =/  cage  contact-update-0+!>([%allow %ships ships])
      [%pass / %agent dock %poke cage]~
    ::
    :: add ourselves to ship's contacts
    =/  dock  [ship %contact-hook]
    =/  cage  contact-ship-add+!>(our.bowl)
    [%pass / %agent dock %poke cage]~
  --
::
++  add-frens
  |=  ships=(list ship)
  ^-  _core
  ?~  ships
    core
  $(ships t.ships, core (add-fren:core i.ships))
::
++  edit-fren
  |=  [=ship pinned=? tags=friend-tags:store]
  ^-  _core
  ?>  =(our.bowl src.bowl)
  =/  fren                (~(got by friends) ship)
  =.  fren                fren(pinned pinned, tags tags)
  =.  friends             (~(put by friends) ship fren)
  %-  emit
  [%give %fact ~[/all] friends-reaction+!>([%friend ship fren])]
::
++  remove-fren
  |=  =ship
  ^-  _core
  ?>  =(our.bowl src.bowl)
  =.  friends             (~(del by friends) ship)
  %-  emil
  :~  =/  dock  [ship dap.bowl]
      =/  cage  friends-action+!>([%bye-fren ~])
      [%pass / %agent dock %poke cage]
      [%give %fact ~[/all] friends-reaction+!>([%bye-friend ship])]
  ==
::
:: ship confirms it is your follower
++  be-fren
  |=  =ship
  ^-  _core
  ?<  =(our.bowl src.bowl)
  ?~  ufren=(~(get by friends) ship)
    =/  fren              [.(status %follower)]:*friend:store
    =.  friends           (~(put by friends) ship fren)
    %-  emit
    [%give %fact ~[/all] friends-reaction+!>([%new-friend ship fren])]
  =/  fren=friend:store  u.ufren
  ?+    status.fren  core
      %following
    =/  fren              fren(status %fren)
    =.  friends           (~(put by friends) ship fren)
    %-  emil
    :~  =/  dock  [ship dap.bowl]
        =/  cage  friends-action+!>([%yes-fren ~])
        [%pass / %agent dock %poke cage]
        [%give %fact ~[/all] friends-reaction+!>([%friend ship fren])]
    ==
      %contact
    =/  fren              fren(status %follower)
    =.  friends           (~(put by friends) ship fren)
    %-  emit
    [%give %fact ~[/all] friends-reaction+!>([%friend ship fren])]
  ==
::
:: ship confirms it is your fren
++  yes-fren
  |=  =ship
  ^-  _core
  ?<  =(our.bowl src.bowl)
  =/  fren                (~(got by friends) ship)
  =.  status.fren         %fren
  =.  friends             (~(put by friends) ship fren)
  %-  emit
  [%give %fact ~[/all] friends-reaction+!>([%friend ship fren])]
::
:: ship notifies you that it is no longer your follower
++  bye-fren
  |=  =ship
  ^-  _core
  ?<  =(our.bowl src.bowl)
  ?~  ufren=(~(get by friends) ship)  core
  =/  fren=friend:store  u.ufren
  ?+    status.fren  core
      %fren
    =/  fren              fren(status %following)
    =.  friends           (~(put by friends) ship fren)
    %-  emit
    [%give %fact ~[/all] friends-reaction+!>([%friend ship fren])]
      %follower
    =.  friends
      ?.  is-contact.fren  (~(del by friends) ship)
      (~(put by friends) ship fren(status %contact))
    %-  emit
    [%give %fact ~[/all] friends-reaction+!>([%bye-friend ship])]
  ==
::
++  non-contacts
  |=  =friends:store
  ^-  friends:store
  %-  ~(gas by *friends:store)
  %+  murn
    ~(tap by friends)
  |=  [=ship =friend:store]
  ^-  (unit [^ship friend:store])
  ?:  =(status.friend %contact)  ~
  (some [ship friend])  
::
++  sour  (scot %p our.bowl)
++  snow  (scot %da now.bowl)
::
++  has-pals           .^(? %gu /[sour]/pals/[snow])
++  has-contact-store  .^(? %gu /[sour]/contact-store/[snow])
++  pals-targets  .^((set ship) %gx /[sour]/pals/[snow]/targets/noun)
++  pals-leeches  .^((set ship) %gx /[sour]/pals/[snow]/leeches/noun)
++  pals-mutuals  .^((set ship) %gx /[sour]/pals/[snow]/mutuals/noun)
::
++  contact-is-public  
  .^(? %gx /[sour]/contact-store/[snow]/is-public/noun)
++  rolodex
  .^(rolodex:store %gx /[sour]/contact-store/[snow]/all/noun)
::
++  pals-frens
  ^-  friends:store
  %-  ~(gas by *friends:store)
  %+  turn  ~(tap in pals-mutuals:core)
  |=(=ship [ship [.(status %fren)]:*friend:store])
::
++  pals-followers
  ^-  friends:store
  %-  ~(gas by *friends:store)
  %+  turn  ~(tap in pals-leeches:core)
  |=(=ship [ship [.(status %follower)]:*friend:store])
::
++  pals-following
  ^-  friends:store
  %-  ~(gas by *friends:store)
  %+  turn  ~(tap in pals-targets:core)
  |=(=ship [ship [.(status %following)]:*friend:store])
::
++  pals-friends
  ^-  friends:store
  (~(uni by pals-followers) (~(uni by pals-following) pals-frens))
--
