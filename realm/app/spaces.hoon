/-  store=spaces, auth-store=auth
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
        auth=spaces-auth:auth-store
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
    =/  our-name  `@t`(scot %p our.bowl)
    =/  our-space  (create-space:lib our.bowl our-name 'our' %our now.bowl)
    =/  initial-spaces  `spaces:store`(~(put by spaces.state) [path:our-space our-space])
    =/  our-auth  (malt `(list (pair ship roles:auth-store))`~[[our.bowl (silt `(list role:auth-store)`~[%owner %admin])]])
    =/  initial-auth   `spaces-auth:auth-store`(malt `(list (pair space-path:store people-map:auth-store))`~[[path:our-space our-auth]])
    ~&  >  '%spaces initialized'
    =.  state  [%0 spaces=initial-spaces auth=initial-auth]
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
        :: %people-action    (action:core !<(action:auth-store vase))
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
    |=  [payload=[name=space-name:store slug=@t type=space-type:store people=people-map:auth-store]]
    ^-  (quip card _state)
    ?>  (team:title our.bowl src.bowl)
    =/  new-space  (create-space:lib our.bowl name.payload slug.payload type.payload now.bowl)
    =.  people.payload    (~(put by people.payload) [our.bowl (silt `(list role:auth-store)`~[%owner %admin])])
    ?:  (~(has by spaces.state) path.new-space)   :: checks if the path exists
      [~ state]
    =.  spaces.state      (~(put by spaces.state) [path.new-space new-space])
    =.  auth.state        (~(put by auth.state) [path.new-space people.payload])
    :-  (send-reaction [%add new-space])
    state
  ::
  ++  handle-update
    |=  [path=space-path:store edit-payload=edit-action:store]
    ^-  (quip card _state)
    ?>  (has-auth:core path src.bowl %admin)
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
    ?>  (has-auth:core path src.bowl %owner)
    :: ?>  (team:title our.bowl src.bowl)
    ?:  =('our' space.path)     :: we cannot delete our space
      [~ state]
    =/  deleted           (~(got by spaces.state) path)
    =.  spaces.state      (~(del by spaces.state) path.deleted)
    =.  auth.state        (~(del by auth.state) path.deleted)
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

++  send-view
  |=  [=reaction:store]
  ^-  (list card)
  =/  paths=(list path)
    [/updates ~]
  [%give %fact paths %spaces-view !>(reaction)]~
::
++  has-auth
  |=  [=space-path:store =ship =role:auth-store]
  (~(has in (~(got by (~(got by auth.state) space-path)) ship)) role)
::
++  is-host
  |=  [=ship]
  =(our.bowl ship)
::
--