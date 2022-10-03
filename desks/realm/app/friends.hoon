::  friends [realm]:
::
::  Friend list management within Realm
::
/-  store=friends, membership-store=membership
/+  dbug, default-agent, lib=friends
|%
+$  card  card:agent:gall
+$  versioned-state
    $%  state-0
    ==
+$  state-0
  $:  %0
      is-public=?
      =friends:store
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
      core   ~(. +> [bowl ~])
  ::
  ++  on-init
    ^-  (quip card _this)
    =.  is-public.state     %.y
    ::  TODO import from pals if installed
    `this
  ::
  ++  on-save
    ^-  vase
    !>(state)
  ::
  ++  on-load
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
        (send-reaction [%friends friends.state] [/all ~])
      ==
    [cards this]
  ::
  ++  on-peek
    |=  =path
    ^-  (unit (unit cage))
    ?+    path  (on-peek:def path)
    ::
    ::  ~/scry/friends/all.json
      [%x %all ~]
        ?>  (team:title our.bowl src.bowl)
        ``noun+!>((view:enjs:lib [%friends friends.state]))
    ::
    ==
  ::
  ++  on-agent    on-agent:def
  ::
  ++  on-leave    on-leave:def
  ::
  ++  on-arvo     on-arvo:def
  ::
  ++  on-fail     on-fail:def
  --
|_  [=bowl:gall cards=(list card)]
::
++  core  .
++  action
  |=  =action:store
  ^-  (quip card _state)
  ?-  -.action
    %add-friend     (add-fren +.action)
    %edit-friend    (edit-fren +.action)
    %remove-friend  (remove-fren +.action)
    %be-fren        (be-fren src.bowl)
    %yes-fren       (yes-fren src.bowl)
    %bye-fren       (bye-fren src.bowl)
  ==
::
++  add-fren
  |=  [=ship]
  ^-  (quip card _state)
  ~&  >  ['adding friend' ship]
  ?:  (~(has by friends.state) ship)   :: checks if is fren is added
      =/  added-fren            (~(got by friends.state) ship)
      =.  mutual.added-fren     %.y
      =.  friends.state         (~(put by friends.state) [ship added-fren])
      :_  state
      :~  [%pass / %agent [ship dap.bowl] %poke friends-action+!>([%yes-fren ~])]  :: confirms you are mutual fren
          [%give %fact [/all ~] friends-reaction+!>([%new-friend ship added-fren])]
      ==
  ::  If the fren is not added yet
  =/  fren
    [
      pinned=%.n
      tags=(silt `(list cord)`[~])
      mutual=%.n
    ]
  =.  friends.state   (~(put by friends.state) [ship fren])
  :_  state
  :~  [%pass / %agent [ship dap.bowl] %poke friends-action+!>([%be-fren ~])]  :: Ask new fren to be fren
      [%give %fact [/all ~] friends-reaction+!>([%new-friend ship fren])]      ::  Notify watchers
  ==
::
++  edit-fren
  |=  [=ship pinned=? tags=friend-tags:store]
  ^-  (quip card _state)
  =/  prev-fren           (~(got by friends.state) ship)
  =.  pinned.prev-fren    pinned
  =.  tags.prev-fren      tags
  =.  friends.state       (~(put by friends.state) [ship prev-fren])
  :_  state
  :~  [%give %fact [/all ~] friends-reaction+!>([%friend ship prev-fren])]      ::  Notify watchers
  ==
::
++  remove-fren
  |=  [=ship]
  ^-  (quip card _state)
  =.  friends.state   (~(del by friends.state) ship)
  :_  state
  :~  [%pass / %agent [ship dap.bowl] %poke friends-action+!>([%bye-fren ~])]  :: Ask new fren to be fren
      [%give %fact [/all ~] friends-reaction+!>([%bye-friend ship])]       ::  Notify watchers
  ==
::
++  be-fren
  |=  [=ship]
  ^-  (quip card _state)
  ?<  =(our.bowl src.bowl)              ::  we can't be-fren ourselves
  =/  is-added    (~(has by friends.state) ship)
  =/  fren
    [
      pinned=%.n
      tags=(silt `(list cord)`[~])
      mutual=is-added
    ]
  ?:  is-added   :: checks if is fren is added
    =.  friends.state       (~(put by friends.state) [ship fren])
    :_  state
    :~  [%pass / %agent [ship dap.bowl] %poke friends-action+!>([%yes-fren ~])]  :: confirms you are mutual fren
    ==
  :: if not, we will add new non-mutual fren
  =.  friends.state       (~(put by friends.state) [ship fren])
  :_  state
  [%give %fact [/all ~] friends-reaction+!>([%friend ship fren])]~        ::  Notify watchers
::
::
++  yes-fren
  |=  [=ship]
  ^-  (quip card _state)
  ?<  =(our.bowl src.bowl)              ::  we can't yes ourselves
  =/  prev-fren           (~(got by friends.state) ship)
  =.  mutual.prev-fren    %.y
  =.  friends.state       (~(put by friends.state) [ship prev-fren])
  :_  state
  :~  [%give %fact [/all ~] friends-reaction+!>([%friend ship prev-fren])]       ::  Notify watchers
  ==
::
++  bye-fren
  |=  [=ship]
  ^-  (quip card _state)
  ?<  =(our.bowl src.bowl)              ::  we can't bye ourselves
  ?.  (~(has by friends.state) ship)    ::  checks if is not fren is added
    `state
  =/  prev-fren           (~(got by friends.state) ship)
  =.  mutual.prev-fren    %.n
  =.  friends.state       (~(put by friends.state) [ship prev-fren])
  :_  state
  :~  [%give %fact [/all ~] friends-reaction+!>([%friend ship prev-fren])]       ::  Notify watchers
  ==
::
++  send-reaction
  |=  [rct=reaction:store paths=(list path)]
  ^-  (list card)
  [%give %fact paths friends-reaction+!>(rct)]~
::
--