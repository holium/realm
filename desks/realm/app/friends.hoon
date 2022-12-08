::  friends [realm]:
::
::  Friend list management within Realm
::
/-  store=friends, membership-store=membership
/+  dbug, default-agent, lib=friends, agentio
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
      io    ~(. agentio bowl)
  ::
  ++  on-init
    ^-  (quip card _this)
    =^  cards  state
      ?.  has-pals:core  `state
      =.  friends  pals-friends:core
      abet:(add-frens:core ~(tap in ~(key by pals-following:core)))
    ::
    :: test add initial frens
    =^  cards  state
      =.  friends  (~(put by friends) ~nec *friend:store)
      =.  friends  (~(put by friends) ~bud *friend:store)
      abet:(add-frens:(cc cards) ~[~nec ~bud])
    ::
    ?.  has-contact-store:core  [cards this]
    =.  friends  (rolodex-to-friends:lib friends rolodex:core)
    :_  this
    ;:  welp
      cards
      :: =;  new-ships
      ::   (new-contacts:core new-ships)
      :: ~(tap in (~(dif in ~(key by rolodex:core)) ~(key by friends)))
      [(~(watch-our pass:io /contacts) %contact-store /all)]~
    ==
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
        [(fact:io friends-reaction+!>([%friends friends]) ~[/all])]~
      ==
    [cards this]
  ::
  ++  on-peek
    |=  =path
    ^-  (unit (unit cage))
    ?+    path  (on-peek:def path)
        [%x %all ~]
      ?>  (team:title our.bowl src.bowl)
      ``noun+!>((view:enjs:lib [%friends friends]))
      ::
        [%x %ships ~]
      ?>  =(our.bowl src.bowl)
      ``noun+!>(~(key by friends))
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
      :_(this [(~(watch-our pass:io /contacts) %contact-store /all)]~)
        %fact
      ?.  =(p.cage.sign %contact-update-0)  `this
      =/  upd  !<(update:store q.cage.sign)
      ?+    -.upd  (on-agent:def wire sign)
          %initial
        =.  friends  (rolodex-to-friends:lib friends rolodex.upd)
        =/  new-ships
          ~(tap in (~(dif in ~(key by rolodex.upd)) ~(key by friends)))
        [(new-contacts:core new-ships) this]
          %add
        =/  ufren  (~(get by friends) ship.upd)
        =/  fren  (contact-to-friend:lib ship.upd ufren contact.upd)
        :_  this(friends (~(put by friends) ship.upd fren))
        ~&  >  ['new contact' ship.upd]
        [(fact:io friends-reaction+!>([%new-friend ship.upd fren]) ~[/all])]~
          %remove
        =/  ufren  (~(get by friends) ship.upd)
        ?~  ufren=(~(get by friends) ship.upd)  `this
        ?:  =(%contact status.u.ufren)
          :_  this(friends (~(del by friends) ship.upd))
          ~&  >  ['remove contact' ship.upd]
          [(fact:io friends-reaction+!>([%bye-friend ship.upd]) ~[/all])]~
        =/  fren  (purge-contact-info:lib u.ufren)
        :_  this(friends (~(put by friends) ship.upd fren))
        ~&  >  ['remove contact info' ship.upd]
        [(fact:io friends-reaction+!>([%friend ship.upd fren]) ~[/all])]~
          %edit
        =/  fren
          (field-edit:lib (~(got by friends) ship.upd) edit-field.upd)
        :_  this(friends (~(put by friends) ship.upd fren))
        ~&  >  ['edit contact' ship.upd]
        [(fact:io friends-reaction+!>([%friend ship.upd fren]) ~[/all])]~
      ==
    ==
  ==
  ::
  ++  on-leave    on-leave:def
  ++  on-arvo     on-arvo:def
  ++  on-fail     on-fail:def
  --
|_  [=bowl:gall cards=(list card)]
+*  io    ~(. agentio bowl)
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
    %add-hostyv     abet:(add-hostyv)
  ==
::
++  test-nickname
  |=  [=ship =friend:store]
  :-  ship
  %=  friend
    nickname
      (crip :(weld (scow %p ship) " (" (trip status.friend) ")"))
  ==
::
++  test-nicknames
  |=  =friends:store
  ^-  friends:store
  %-  ~(gas by *friends:store)
  (turn ~(tap by friends) test-nickname)
::
++  add-fren
  |=  =ship
  ^-  _core
  |^
  =*  poke-other  ~(poke-other pass /)
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
      (emit (poke-other ship friends-action+!>([%yes-fren ~])))
    (emit (fact:io friends-reaction+!>([%new-friend ship fren]) ~[/all]))
  :: If the fren is not added yet
  =/  fren     [.(status %following)]:*friend:store
  =.  friends  (~(put by friends) ship fren)
  %-  emil
  %+  welp  contact-cards
  :~  (poke-other ship friends-action+!>([%be-fren ~]))
      (fact:io friends-reaction+!>([%new-friend ship fren]) ~[/all])
  ==
  ++  contact-cards
    ^-  (list card)
    %+  welp
      ?:  contact-is-public:core  ~
      :_  ~
      %+  ~(poke-our pass:io /)
        %contact-store
      contact-update-0+!>([%allow %group ship %'']) 
    :_  ~
    %+  ~(poke pass:io /)
      [ship %contact-push-hook]
    contact-share+!>([%share our.bowl]) 
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
  =/  fren                [.(pinned pinned, tags tags)]:(~(got by friends) ship)
  =.  friends             (~(put by friends) ship fren)
  (emit (fact:io friends-reaction+!>([%friend ship fren]) ~[/all]))
::
++  remove-fren
  |=  =ship
  ^-  _core
  =*  poke-other          ~(poke-other pass /)
  ?>  =(our.bowl src.bowl)
  =.  friends             (~(del by friends) ship)
  %-  emil
  :~  (poke-other ship friends-action+!>([%bye-fren ~]))
      (fact:io friends-reaction+!>([%bye-friend ship]) ~[/all])
  ==
::
:: ship confirms following you
++  be-fren
  |=  =ship
  ^-  _core
  =*  poke-other          ~(poke-other pass /)
  ?<  =(our.bowl src.bowl)
  ?~  ufren=(~(get by friends) ship)
    =/  fren              [.(status %follower)]:*friend:store
    =.  friends           (~(put by friends) ship fren)
    (emit (fact:io friends-reaction+!>([%new-friend ship fren]) ~[/all]))
  =/  fren=friend:store  u.ufren
  ?+    status.fren  core
      %following
    =/  fren              fren(status %fren)
    =.  friends           (~(put by friends) ship fren)
    %-  emil
    :~  (poke-other ship friends-action+!>([%yes-fren ~]))
        (fact:io friends-reaction+!>([%friend ship fren]) ~[/all])
    ==
      %contact
    =/  fren              fren(status %follower)
    =.  friends           (~(put by friends) ship fren)
    (emit (fact:io friends-reaction+!>([%friend ship fren]) ~[/all]))
  ==
::
:: ship confirms following you
++  yes-fren
  |=  =ship
  ^-  _core
  ?<  =(our.bowl src.bowl)
  =/  fren                (~(got by friends) ship)
  =.  status.fren         %fren
  =.  friends             (~(put by friends) ship fren)
  (emit (fact:io friends-reaction+!>([%friend ship fren]) ~[/all]))
::
:: ship stops following you
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
    (emit (fact:io friends-reaction+!>([%friend ship fren]) ~[/all]))
      %follower
    =.  friends
      ?.  is-contact.fren  (~(del by friends) ship)
      (~(put by friends) ship fren(status %contact))
    (emit (fact:io friends-reaction+!>([%bye-friend ship]) ~[/all]))
  ==
::
++  new-contacts
  |=  ships=(list ship)
  ^-  (list card)
  %+  turn  ships
  |=  =ship
  =/  fren  (~(got by friends) ship)
  ~&  >  ['new contact' ship]
  (fact:io friends-reaction+!>([%new-friend ship fren]) ~[/all])
::
:: Test pokes ...
++  add-hostyv  |.(`_core`!!)
:: Add pokes to test 
::   |.
::   ^-  _core
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
::
++  pass
  |_  =wire
  ++  poke-other
    |=  [other=@p =cage]
    ^-  card
    (~(poke pass:io wire) [other dap.bowl] cage)
  --
--
