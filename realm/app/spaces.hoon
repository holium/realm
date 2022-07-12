/-  store=spaces
/+  default-agent, verb, dbug, lib=spaces
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
        spaces=spaces:store
        :: permission
    ==
  --
=|  state-0
=*  state  -
=<
  %+  verb  &
  %-  agent:dbug
  |_  =bowl:gall
  +*  this  .
      def   ~(. (default-agent this %|) bowl)
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
        ::    :spaces &space [%add 'other-life' %group]
        ::    :spaces &space [%update [~fes 'other-life'] [%name name="The Other Life"]]
        ::
        %spaces-action    (action:core !<(action:store vase))
      ==
    [cards this]
    --
  ++  on-peek
    |=  =path
    ^-  (unit (unit cage))
    ?+    path  (on-peek:def path)
    ::
    ::  ~/scry/spaces.json
    ::
      [%x ~]        ``noun+!>((view:enjs:lib [%spaces spaces.state]))
    ::
    ::  ~/scry/spaces/~fes/our.json
    ::
      [%x @ @ ~]
    =/  =ship       (slav %p i.t.path)
    =/  space-pth   `@t`i.t.t.path
    =/  space       (~(got by spaces.state) [ship space-pth])
    ``noun+!>((view:enjs:lib [%space space]))
    ==
  ++  on-watch  
    |=  =path
    ^-  (quip card _this)
    =/  cards=(list card)
    ~&  >  path
      ?+  path        (on-watch:def path)
        [%updates ~]  (send-reaction:core [%initial spaces.state])
      ::
      ==
    [cards this]
    ::
  ++  on-leave  |=(path `..on-init)
  ++  on-agent  |=([wire sign:agent:gall] !!)
  ++  on-arvo   |=([wire sign-arvo] !!)
  ++  on-fail   |=([term tang] `..on-init)
  --
::
|_  [=bowl:gall cards=(list card)]
::
++  core  .
::
++  action
  |=  [act=action:store]
  ^-  (quip card _state)
  |^
  ?-  -.act
    %add        (handle-add +.act)
    %update     (handle-update +.act)
    %remove     (handle-remove +.act)
  ==
  ::
  ++  handle-add
    |=  [payload=[name=space-name:store slug=@t type=space-type:store]]
    ^-  (quip card _state)
    =/  new-space  (create-space:lib our.bowl name.payload slug.payload type.payload now.bowl)
    ?:  (~(has by spaces.state) path.new-space)   :: checks if the path exists
      [~ state]
    :-  (send-reaction [%add new-space])
    state(spaces (~(put by spaces.state) [path.new-space new-space]))
  ::
  ++  handle-update
    |=  [path=space-path:store edit-payload=edit-action:store]
    ^-  (quip card _state)
    =/  old                   (~(got by spaces.state) path)
    =/  updated               `space:store`(edit-space old edit-payload)
    ?:  =(old updated)        :: if the old type equals new
        [~ state]             :: return state unchange
    =.  updated-at.updated    now.bowl
    :-  (send-reaction [%replace updated])
    state(spaces (~(put by spaces.state) path updated))
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
  ::
  ++  handle-remove
    |=  [path=space-path:store]
    ^-  (quip card _state)
    ?>  (team:title our.bowl src.bowl)
    ?:  =('our' space.path)
      [~ state]
    =/  deleted          (~(got by spaces.state) path)
    =.  spaces.state      (~(del by spaces.state) path.deleted)
    :-  (send-reaction [%remove path])
    state
  ::
  --
::
++  send-reaction
  |=  [=reaction:store]
  ^-  (list card)
  =/  paths=(list path)
    [/updates ~]
  [%give %fact paths %spaces-reaction !>(reaction)]~

++  send-scry
  |=  [=reaction:store]
  ^-  (list card)
  =/  paths=(list path)
    [/updates ~]
  [%give %fact paths %spaces-view !>(reaction)]~

++  is-host
  |=  [=ship]
  =(our.bowl ship)
::
--