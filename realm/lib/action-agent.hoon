::  action-agent: base agent for agents leverage the action/reaction/effect framework
::
::
/-  *act
/+  dbug
|%
+$  versioned-state
    $%  state-0
    ==
::  ~lodlev-migdev - the action agent manages its own state; but must
::   also manage/persist the underlying app's (derived app) state for this
::   model to work
+$  state-0  [%0 store=(map @t json) app-state=* app-state-type=type]
::
++  agent
  |=  =agent:gall
  =|  state-0
  =*  state  -
  %-  agent:dbug
  ^-  agent:gall
  =<
    |_  =bowl:gall
    +*  this  .
        ag    ~(. agent bowl)
    ::
    ++  on-init
      ^-  (quip card:agent:gall agent:gall)
      =^  cards  agent  on-init:ag

      [cards this]
    ::
    ++  on-save
      ^-  vase
      =/  app-state  on-save:ag
      =.  app-state-type.state  -.app-state
      =.  app-state.state  +.app-state
      :: ~&  >  state
      !>(state)
      :: on-save:ag
    ::
    ++  on-load
      |=  old-state=vase
      ^-  (quip card:agent:gall agent:gall)
      :: (on-load:ag old-state)
      =/  old  !<(versioned-state old-state)
      ?-  -.old
        %0
          =^  cards  agent  (on-load:ag [app-state-type.old app-state.old])
          `this(state old)
      ==
    ::
    ++  on-poke
      |=  [=mark =vase]
      ^-  (quip card:agent:gall agent:gall)
      (on-poke:ag mark vase)
      :: ?+    mark  (on-poke:def mark vase)

      ::     %handle-http-request
      ::       =^  cards  state
      ::         (on-http-request !<((pair @ta inbound-request:eyre) vase))
      ::       [cards this]
      ::   ==

    ::
    ++  on-peek
      |=  =path
      ^-  (unit (unit cage))
      ?+  path  [~ ~]
        [%x %dbug %state ~]
          ~&  >  "[action-agent state]"
          ~&  >  "{<store.state>}"
          (on-peek:ag path)
      ==
    ::
    ++  on-watch
      |=  =path
      ^-  (quip card:agent:gall agent:gall)
      =^  cards  agent  (on-watch:ag path)
      [cards this]
    ::
    ++  on-leave
      |=  =path
      ^-  (quip card:agent:gall agent:gall)
      =^  cards  agent  (on-leave:ag path)
      [cards this]
    ::
    ++  on-agent
      |=  [=wire =sign:agent:gall]
      ^-  (quip card:agent:gall agent:gall)
      =^  cards  agent  (on-agent:ag wire sign)
      [cards this]
    ::
    ++  on-arvo
      |=  [=wire =sign-arvo]
      ^-  (quip card:agent:gall agent:gall)
      =^  cards  agent  (on-arvo:ag wire sign-arvo)
      [cards this]
    ::
    ++  on-fail
      |=  [=term =tang]
      ^-  (quip card:agent:gall agent:gall)
      =^  cards  agent  (on-fail:ag term tang)
      [cards this]
    --

    :: ++  get
    ::   |=  [=path mark=@tas]
    ::   ^-  (unit vase)

    ::   =/  segs  `(list @ta)`path
    ::   ?:  =(0 (lent segs))  (some !>(~))
    ::   =/  num-segs  (lent segs)
    ::   =/  seg-0  (snag 0 segs)

    ::   =/  start-node  (~(get by store) seg-0)
    ::   ?~  start-node  (some !>(~))
    ::   =/  start-node  (need start-node)

    ::   =/  result=[seg=@ud curr=json data=vase]
    ::   %-  roll
    ::   :-  segs
    ::   |:  [seg=`@ta`seg-0 acc=[seg=`@ud`0 curr=`json`store data=`vase`!>(~)]]
    ::     =/  node  ?:(?=([%o *] curr.acc) p.curr.acc ~)
    ::     =/  data  (~(get by node) seg)
    ::     =/  data  ?~(data ~ (need data))
    ::     ::  are we at the last segment of the path?
    ::     ?:  =(seg.acc (sub num-segs 1))
    ::       =/  val  .^(tube:clay %cc /===/json/(scot %tas mark)) !>(data))
    ::       [(add seg.acc 1) data val]
    ::     [(add seg.acc 1) data ~]

    ::   (some data.result)

    :: ++  initialize
    ::   |=  [jon=json]
    ::   ^-  action-result:plugin

    ::   =/  config-file=path  /(scot %p our.bowl)/(scot %tas dap.bowl)/(scot %da now.bowl)/cfg/(scot %tas dap.bowl)/json

    ::   ?.  .^(? %cu config-file)
    ::     ~&  >>>  "{<dap.bowl>}: {<dap.bowl>} config file not found. create a /cfg/{<dap.bowl>}/.json file and try again"
    ::     !!

    ::   =/  config  .^(json %cx config-file)
    ::   =/  cfg  ((om json):dejs:format config)

    ::   =/  log-level  (~(get by cfg) 'log-level')
    ::   =/  log-level  ?~  log-level
    ::     ~&  >>  "{<dap.bowl>}: log-level not found in config. defaulting to 0."
    ::     0
    ::   (ni:dejs:format (need log-level))

    ::   :: =/  config-file=path  /(scot %p our.bowl)/(scot %tas dap.bowl)/(scot %da now.bowl)/(scot %tas dap.bowl)/resources/cfg

    ::   :: ?.  .^(? %cu config-file)
    ::   ::   ~&  >>>  "{<dap.bowl>}: /lib/{<dap.bowl>}/resources config file not found. create a /lib/{<dap.bowl>}/resources/.cfg file and try again"
    ::   ::   `store

    ::   :: =/  resources  .^(json %cx config-file)
    ::   =/  resources  (~(get by cfg) 'resources')
    ::   ?~  resources
    ::     ~&  >>>  "{<dap.bowl>}: {<dap.bowl>} resources not found. fix the config file, nuke, and reinstall"
    ::     !!
    ::   =/  resources  (need resources)

    ::   ~&  >  "{<dap.bowl>}: initialized"

    ::   =/  action=json
    ::   %-  pairs:enjs:format
    ::   :~
    ::     ['resource' s+dap.bowl]
    ::     ['action' s+'initialize']
    ::     ['context' ~]
    ::     ['data' ~]
    ::   ==

    ::   =/  store  (to-map:plugin store)
    ::   =/  store  (~(put by store) 'resources' resources)
    ::   =/  effects
    ::     :~  [%pass /(scot %tas dap.bowl) %agent [our.bowl dap.bowl] %poke %json !>(action)]
    ::     ==

    ::   `action-result:plugin`[success=%.y data=~ store=[%o store] effects=effects]

    ::

|_  =bowl:gall
:: ::
:: :: $on-http-request: Called when http request received from Eyre.
:: ::   All actions come into our agent as POST requests.
:: ::
:: ++  on-http-request
::   |=  [req=(pair @ta inbound-request:eyre)]
::   ^-  (quip card _state)

::   :: ?:  ?&  =(authentication.state 'enable')
::   ::         !authenticated.q.req
::   ::     ==
::   ::     ~&  >>>  "{<dap.bowl>}: authentication is enabled. request is not authenticated"
::   ::     (send-api-error req 'not authenticated')

::   :: parse query string portion of url into map of arguments (key/value pair)
::   =/  req-args
::         (my q:(need `(unit (pair pork:eyre quay:eyre))`(rush url.request.q.req ;~(plug apat:de-purl:html yque:de-purl:html))))

::   =/  path  (stab url.request.q.req)

::   ::  all actions come in as POST method requests over http
::   ?+    method.request.q.req  (send-api-error req 'unsupported')

::         %'POST'
::           (handle-resource-action-http req req-args)

::   ==

:: ::
:: :: $handle-resource-action-http: Handles action payloads that come in via http
:: ::
:: ++  handle-resource-action-http
::   |=  [req=(pair @ta inbound-request:eyre) args=(map @t @t)]
::   ^-  (quip card _state)

::   =/  til=octs
::         (tail body.request.q.req)

::   ::  variable to hold request body (as $json)
::   =/  payload  (need (de-json:html q.til))

::   =/  result=action-result:plugin  (handle-resource-action payload)

::   =/  =response-header:http
::     :-  ?:(success.result 200 500)
::     :~  ['Content-Type' 'application/json']
::     ==

::   =/  response-data  (crip (en-json:html data.result))

::   ::  convert the string to a form that arvo will understand
::   =/  data=octs
::         (as-octs:mimes:html response-data)

::   :_  store.result
::   :~
::     [%give %fact [/http-response/[p.req]]~ %http-response-header !>(response-header)]
::     [%give %fact [/http-response/[p.req]]~ %http-response-data !>(`data)]
::     [%give %kick [/http-response/[p.req]]~ ~]
::   ==

:: ++  handle-resource-action-poke
::   |=  [payload=json]
::   ^-  [(list card) json]

::   =/  result=action-result:plugin  (handle-resource-action payload)

::   :_  store.result  effects.result

:: ++  handle-resource-action
::   |=  [payload=json]
::   :: ^-  [(list card) (map @t json)]
::   ^-  action-result:plugin

::   ::  check store in state to ensure there's configured resources
::   =/  store  (to-map:plugin store)

::   =/  resources  (~(get by store) 'resources')
::   ?~  resources  (send-error "{<dap.bowl>}: invalid agent state. missing resources" ~)
::   =/  resources  (to-map:plugin (need resources))

::   ::  do some initial validation
::   =/  action-payload  (to-map:plugin payload)

::   =/  context  (~(get by action-payload) 'context')
::   ?~  context  (send-error "{<dap.bowl>}: invalid payload. missing context element" ~)
::   =/  context  (to-map:plugin (need context))

::   =/  action  (~(get by action-payload) 'action')
::   ?~  action  (send-error "{<dap.bowl>}: invalid payload. missing action element" ~)
::   =/  action  (so:dejs:format (need action))

::   =/  data  (~(get by action-payload) 'data')
::   ?~  data  (send-error "{<dap.bowl>}: invalid payload. missing data element" ~)
::   =/  data  (need data)

::   =/  resource  (~(get by action-payload) 'resource')
::   ?~  resource  (send-error "{<dap.bowl>}: invalid payload. missing resource element" ~)
::   =/  resource  (so:dejs:format (need resource))

::   =/  resource-store  (~(get by resources) resource)
::   ?~  resource-store  (send-error "{<dap.bowl>}: resource {<resource>} store not found" ~)
::   =/  resource-store  ((om json):dejs:format (need resource-store))

::   =/  dispatch-mode  (~(get by resource-store) 'dispatcher')
::   =/  dispatch-mode  ?~(dispatch-mode 'direct' (so:dejs:format (need dispatch-mode)))

::   =+  c-ctx=`call-context:plugin`[bowl args=context store=[%o store] payload=data]

::   ?+  dispatch-mode  (send-error "{<dap.bowl>}: unrecognized dispatcher value" ~)

::     %direct
::       (execute-direct resource action c-ctx)

::     %proxy
::       (execute-by-proxy resource action c-ctx)

::   ==

:: ++  execute-direct
::   |=  [resource=@t action=@t c=call-context:plugin]
::   :: ^-  [(list card) (map @t json)]
::   ^-  action-result:plugin

::   =/  lib-file=path  /(scot %p our.bowl)/(scot %tas dap.bowl)/(scot %da now.bowl)/lib/(scot %tas dap.bowl)/resources/(scot %tas resource)/(scot %tas action)/hoon

::   ?.  .^(? %cu lib-file)
::     (send-error "{<dap.bowl>}: resource action lib file {<lib-file>} not found" ~)

::   =/  action-lib  .^([p=type q=*] %ca lib-file)
::   =/  on-func  (slam (slap action-lib [%limb %on]) !>([bowl.c store.c args.c]))
::   =/  result  !<(action-result:plugin (slam (slap on-func [%limb %action]) !>(payload.c)))

::   result

:: ++  execute-by-proxy
::   |=  [resource=@t action=@t c=call-context:plugin]
::   :: ^-  [(list card) (map @t json)]
::   ^-  action-result:plugin

::   =/  lib-file=path  /(scot %p our.bowl)/(scot %tas dap.bowl)/(scot %da now.bowl)/lib/(scot %tas dap.bowl)/resources/(scot %tas resource)/actions/hoon

::   ?.  .^(? %cu lib-file)
::     (send-error "{<dap.bowl>}: resource action lib file {<lib-file>} not found" ~)

::   =/  action-lib  .^([p=type q=*] %ca lib-file)
::   =/  on-func  (slam (slap action-lib [%limb %on]) !>([bowl.c store.c args.c]))
::   =/  result=action-result:plugin  !<(action-result:plugin (slam (slap on-func [%limb action]) !>(payload.c)))

::   result

:: ::  send an error as poke back to calling agent
:: ++  send-error
::   |=  [reason=tape jon=json]
::   :: ^-  [(list card) (map @t json)]
::   ^-  action-result:plugin
::   ~&  >>>  (crip reason)
::   ::  if json is null, send back reason error as json string
::   =/  payload=json  ?~  jon
::         ::  then
::         s+(crip reason)  :: send back reason error as string
::       :: else stuff payload with error message
::       %-  pairs:enjs:format
::       :~
::         ['error' s+(crip reason)]
::       ==

::   ?.  =(our.bowl src.bowl)
::     ::  ensure action: 'error' in json for this to be recognized
::     ::   on the remote agent
::     =/  effects
::     :~  [%pass /errors %agent [src.bowl dap.bowl] %poke %json !>(payload)]
::     ==
::     !<(action-result:plugin !>([success=%.n data=payload effects=effects]))
::     :: :_  store
::     :: :~  [%pass /errors %agent [src.bowl dap.bowl] %poke %json !>(payload)]
::     :: ==
::   (give-error payload)

:: ::  use this for errors that should appear in UI
:: ++  give-error
::   |=  [jon=json]
::   :: ^-  [(list card) (map @t json)]
::   ^-  action-result:plugin
::   =/  effects
::   :~  [%give %fact ~[/errors] %json !>(jon)]
::   ==
::   !<(action-result:plugin !>([success=%.n data=jon store=store effects=effects]))
::   :: :_  store
::   :: :~  [%give %fact ~[/errors] %json !>(jon)]
::   :: ==

:: ++  send-api-error
::   |=  [req=(pair @ta inbound-request:eyre) msg=@t]

::   =/  =response-header:http
::     :-  500
::     :~  ['Content-Type' 'text/plain']
::     ==

::   ::  convert the string to a form that arvo will understand
::   =/  data=octs
::         (as-octs:mimes:html msg)

::   :_  store
::   :~
::     [%give %fact [/http-response/[p.req]]~ %http-response-header !>(response-header)]
::     [%give %fact [/http-response/[p.req]]~ %http-response-data !>(`data)]
::     [%give %kick [/http-response/[p.req]]~ ~]
::   ==

::   ++  handle-scry
::     |=  res-path=path
::     ^-  (unit (unit cage))

::     =/  result=action-result:plugin  (path-to-action:plugin bowl store res-path)

::     ?~(data.result ~ ``json+!>(data.result))

::   ++  invoke
::     |=  res-path=path
::     ^-  [(list card) json]

::     =/  result=action-result:plugin  (path-to-action:plugin bowl store res-path)

::     :_  store.result

::     effects.result
  --
--