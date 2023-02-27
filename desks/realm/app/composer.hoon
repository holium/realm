/-  store=composer
/+  default-agent, dbug, lib=composer
|%
+$  versioned-state
  $%  state-0
  ==
+$  state-0  [%0 =compositions:store]
+$  card  card:agent:gall
--
%-  agent:dbug
=|  state-0
=*  state  -
^-  agent:gall
=<
  |_  =bowl:gall
  +*  this  .
      def   ~(. (default-agent this %.n) bowl)
      core   ~(. +> [bowl ~])
  ::
  ++  on-init
    ^-  (quip card _this)
    `this
  ::
  ++  on-save
    ^-  vase
    !>(state)
  ::
  ++  on-load
    |=  old-state=vase
    ^-  (quip card _this)
    =/  old  !<(versioned-state old-state)
    ?-  -.old
      %0  `this(state old)
    ==
  ::
  ++  on-poke
    |=  [=mark =vase]
    ^-  (quip card _this)
    ?+  mark  (on-poke:def mark vase)
        %composer-action
      =^  cards  state
        ^-  (quip card _state)
        (action:core !<(action:store vase))
      [cards this]
    ==
  ++  on-watch  on-watch:def
  ++  on-leave  on-leave:def
  ++  on-peek
    |=  =path
    ^-  (unit (unit cage))
    ?+    path  (on-peek:def path)
        [%x %all ~] :: ~/scry/composer/all.json
      ?>  (team:title our.bowl src.bowl)
      ``noun+!>((view:enjs:lib [%compositions compositions]))
      ::
    ==
  ++  on-agent  on-agent:def
  ++  on-arvo   on-arvo:def
  ++  on-fail   on-fail:def
  --
|_  [=bowl:gall cards=(list card)]
::
++  core  .
++  action
  |=  act=action:store
  ^-  (quip card _state)
  ?-  -.act
    %add-space  (handle-add-space +.act)
    %remove-space  (handle-remove-space +.act)
    %add-stack  (handle-add-stack +.act)
    %remove-stack  (handle-remove-stack +.act)
    %set-current-stack  (handle-set-current-stack +.act)
    %set-window  (handle-set-window +.act)
    %remove-window  (handle-remove-window +.act)
  ==
::
++  handle-add-space
  |=  =space-path:store
  =.  compositions  (~(put by compositions) [space-path *composer:store])
  `state
::
++  handle-remove-space
  |=  =space-path:store
  =.  compositions  (~(del by compositions) [space-path *composer:store])
  `state
::
++  handle-add-stack
  |=  [=space-path:store =stack:store]
  =.  compositions
    =/  composer  (~(got by compositions) space-path)
    =.  stacks.composer  (~(put by stacks.composer) [id.stack stack])
    (~(put by compositions) [space-path composer])
  `state
::
++  handle-remove-stack
  |=  [=space-path:store =stack-id:store]
  =.  compositions
    =/  composer  (~(got by compositions) space-path)
    =.  stacks.composer  (~(del by stacks.composer) stack-id)
    (~(put by compositions) [space-path composer])
  `state
::
++  handle-set-current-stack
  |=  [=space-path:store =stack-id:store]
  =.  compositions
    =/  composer  (~(got by compositions) space-path)
    =.  current.composer  stack-id
    (~(put by compositions) [space-path composer])
  `state
::
++  handle-set-window
  |=  [=space-path:store =stack-id:store =window:store]
  =.  compositions
    =/  composer  (~(got by compositions) space-path)
    =/  stack  (~(got by stacks.composer) stack-id)
    =.  windows.stack  (~(put by windows.stack) [id.window window])
    =.  current.composer  stack-id
    (~(put by compositions) [space-path composer])
  `state
::
++  handle-remove-window
  |=  [=space-path:store =stack-id:store window-id=@t]
  =.  compositions
    =/  composer  (~(got by compositions) space-path)
    =/  stack  (~(got by stacks.composer) stack-id)
    =.  windows.stack  (~(del by windows.stack) window-id)
    =.  current.composer  stack-id
    (~(put by compositions) [space-path composer])
  `state
::
--
