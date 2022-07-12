/-  store=spaces
/+  default-agent, dbug, lib=spaces, *string
^-  agent:gall
::
::  %spaces [realm]:
::
::  A store for Realm space metadata and management.
::
::  Should watch and sync data with the %group-store under /landscape.
::
=>
  |%
  +$  card  card:agent:gall
  +$  versioned-state
      $%  state-0
      ==
  +$  state-0
    $:  %0
        =spaces:store
    ==
  --
=|  state-0
=*  state  -
=<
  %-  agent:dbug
  |_  =bowl:gall
  +*  this  .
      def   ~(. (default-agent this %.n) bowl)
      core   ~(. +> [bowl ~])
  ::
  ++  on-init
    ^-  (quip card _this)
    ~&  >  '%spaces initialized'
    =/  our-name  `@t`(scot %p our.bowl)
    =/  our-space  (create-space:lib our.bowl our-name 'our' %our now.bowl)
    =/  initial-spaces  `spaces:store`(~(put by spaces.state) [path:our-space our-space])
    =.  state  [%0 spaces=initial-spaces]       ::  set initial state
    :-  ~  this
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
    ?>  (team:title our.bowl src.bowl) :: is our ship or moon
    |^
    =^  cards  state
      ?+  mark  (on-poke:def mark vase)
        ::
        ::  %space actions
        ::
        ::  Usage:
        ::    :spaces &space [%create 'other-life' %group]
        ::    :spaces &space [%edit [~fes 'other-life'] [%name name="The Other Life"]]
        ::
        %spaces-action    (action !<(action:store vase) now.bowl)
      ==
    [cards this]
    --
  ++  on-peek
    |=  =path
    ^-  (unit (unit cage))
    ?+    path  (on-peek:def path)
    ::
    ::  ~/scry/spaces/all.json
    ::
      [%x %all ~]     ``noun+!>((reaction:enjs:lib [%all spaces.state]))
    ::
    ::  ~/scry/spaces/space/~fes/our.json
    ::
      [%x %space @ @ ~]
    =/  =ship       (slav %p i.t.t.path)
    =/  space-pth   `@t`i.t.t.t.path
    =/  space  (~(got by spaces.state) [ship space-pth])
    ``noun+!>((reaction:enjs:lib [%space space]))
    ==
  ++  on-watch  |=(path !!)
  ++  on-leave  |=(path `..on-init)
  ++  on-agent  |=([wire sign:agent:gall] !!)
  ++  on-arvo   |=([wire sign-arvo] !!)
  ++  on-fail   |=([term tang] `..on-init)
  --
:: |_  [=bowl:gall cards=(list card)]
:: ++  core  .
|_  =bowl:gall
++  action
  |=  [act=action:store timestamp=@da]
  ^-  (quip card _state)
  |^
  :: ~&  >  [+.action]
  ?-  -.act
    %create    (handle-create +.act)
    %edit      (handle-edit +.act)
    :: %delete    (handle-create +.action)
  ==
  ::
  ++  handle-create
    |=  [payload=[name=space-name:store slug=@t type=space-type:store]]
    ^-  (quip card _state)
    =/  new-space  (create-space:lib our.bowl name.payload slug.payload type.payload timestamp)
    :: TODO check if path already exists

    ~&  >  [new-space]
    `state(spaces (~(put by spaces.state) [path.new-space new-space]))
  :: --
  :: --
  ++  handle-edit
    |=  [path=space-path:store edit-payload=edit-action:store]
    ^-  (quip card _state)
    =/  old                   (~(got by spaces.state) path)
    =/  updated               (edit-space old edit-payload)
    ?:  =(old updated)        :: if the old type equals new
        [~ state]             :: return state unchange
    ~&  >  [now.bowl]
    =.  updated-at.updated    timestamp
    :: :-  (send-reaction [%edit updated])
    `state(spaces (~(put by spaces.state) path updated))
    ::
    ++  edit-space
      |=  [=space:store edit=edit-action:store]
      ^-  space:store
      ?-  -.edit
        %name       space(name name.edit)
        %picture    space(picture picture.edit)
        %color      space(color color.edit)
        %theme      space(theme theme.edit)
      ==
  
    :: ++  send-diff
    ::   |=  [=reaction:store]
    ::   ^-  (list card)
    ::   =/  paths=(list path)
    ::     [/updates /all ~]
    ::   [%give %fact paths %spaces-action !>(reaction)]~
    :: --
    :: =/  new-space  (create-space:lib our.bowl name.payload slug.payload type.payload)
    :: :: TODO check if path already exists

    :: ~&  >  [new-space]
    :: `state(spaces (~(put by spaces.state) [path.new-space new-space]))
  --

:: ++  reaction

:: ++  poke-handler
::   |=  [=mark =vase]
::   ^+  core
::   ?+  mark  (on-poke:def mark vase)
::         %initial      `state

::       ==
:: ++  spaces-core
::   |=  [=mark =vase]
::   ++  action
::     |=  =action:store
::     ^-  (quip card _state)
::     |^
::     ?-  -.action
::       %add    (handle-add +.action)
::     ==
::     ::
::     ++  handle-add
::       |=  [payload=space-add-payload *]
::       ^-  (quip card _state)
::       ::
::       state(sp state)
::   --
--