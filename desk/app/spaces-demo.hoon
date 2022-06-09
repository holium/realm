:: ***********************************************************
::
::  @author  : ~lodlev-migdev
::  @purpose :
::    Realm spaces agent demo app
::
:: ***********************************************************
/+  default-agent, dbug
|%
::  helper to allow for card shorthand when referencing card's in this agent
+$  card  card:agent:gall

+$  base-result  [success=? msg=(unit @t) data=(unit vase)]
:: +$  space  [key=@t name=@t type=@t data=json]
:: +$  action
::   $%  [%create-space space]
::       [%open diff:open]
::       [%replace =policy]
::   ==
+$  base-action
  $:  action=@t
      resource=@t
      context=(map @t json)
      data=json
  ==
+$  versioned-state
    $%  state-0
    ==
+$  state-0  [%0 spaces=(map @t json)]
--
%-  agent:dbug
=|  state-0
=*  state  -
^-  agent:gall
|_  =bowl:gall
+*  this  .
    def   ~(. (default-agent this %.n) bowl)
++  on-init
  ^-  (quip card _this)

  %-  (slog leaf+"{<dap.bowl>}: on-init" ~)

  :_  this

      ::   setup route for direct http request/response handling
  :~  [%pass /bind-route %arvo %e %connect `/'realm'/'spaces'/'api'/'actions' %spaces-demo]
  ==
::
++  on-save
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
::
++  on-poke
  |=  [=mark =vase]
  ^-  (quip card _this)
  |^

  ?+    mark  (on-poke:def mark vase)

      %json
        =^  cards  state

        =/  jon  !<(json vase)

          (handle-channel-poke jon)

        [cards this]

      %handle-http-request
        =^  cards  state

        =/  req  !<((pair @ta inbound-request:eyre) vase)

          (handle-http-request req)

        [cards this]
    ==

    ++  to-action
      |=  [data=json]
      ^-  base-result

      =/  payload  ?:(?=([%o *] data) p.data ~)

      =/  action  (~(get by payload) 'action')
      ?~  action  `base-result`[%.n (some 'invalid payload. missing action.') (some !>(o+payload))]
      =/  action  (need action)

      =/  resource  (~(get by payload) 'resource')
      ?~  resource  `base-result`[%.n (some 'invalid payload. missing resource.') (some !>(o+payload))]
      =/  resource  (need resource)

      =/  context  (~(get by payload) 'context')
      ?~  context  `base-result`[%.n (some 'invalid payload. missing context.') (some !>(o+payload))]
      =/  context  (need context)

      =/  data  (~(get by payload) 'data')
      =/  data  ?~(data ~ (need data))

      =|  result=base-action
      =.  action.result  (so:dejs:format action)
      =.  resource.result  (so:dejs:format resource)
      =.  context.result  ?:(?=([%o *] context) p.context ~)
      =.  data.result  data

      `base-result`[%.y ~ (some !>(result))]

    ++  to-json
      |=  [act=base-action]
      ^-  json

      =/  result
      %-  pairs:enjs:format
      :~
        ['action' s+action.act]
        ['resource' s+resource.act]
        ['context' o+context.act]
        ['data' data.act]
      ==

      result

    ++  handle-http-request
      |=  [req=(pair @ta inbound-request:eyre)]

      ::  parse query string arguments into key/value pair (map)
      =/  req-args
            (my q:(need `(unit (pair pork:eyre quay:eyre))`(rush url.request.q.req ;~(plug apat:de-purl:html yque:de-purl:html))))

      ::
      =/  path  (stab url.request.q.req)

      =/  til=octs  (tail body.request.q.req)

      =/  content  (need (de-json:html q.til))

      ::  convert http request POST body to action object instance
      =/  result=base-result  (to-action content)

      ::  bail on error and make sure to send back error message
      ?.  success.result
        =/  payload=json  ?~(data.result ~ !<(json (need data.result)))
        (send-api-error req payload msg.result)

      =/  act  !<(base-action (need data.result))

      ?+    method.request.q.req  (send-api-error req (to-json act) (some 'unsupported'))

            %'POST'
              ?+  path  (send-api-error req (to-json act) (some 'route not found'))

                [%realm %spaces %api %actions ~]
                  (handle-resource-action req req-args act)

              ==

      ==

    ::*****************************************************
    ::  ARM
    ::  ++  handle-resource-action
    ::  @parms
    ::    req - eyre http request
    ::    args - query string arguments as string/string key/value pairs
    ::    act - action object instance parsed from incoming POST body
    ::
    ++  handle-resource-action
      |=  [req=(pair @ta inbound-request:eyre) args=(map @t @t) act=base-action]
      ^-  (quip card _state)

      ?+  [resource.act action.act]
        (send-api-error req (to-json act) (some (crip "{<dap.bowl>}: error. unrecognized action {<[resource.act action.act]>}")))

        [%spaces %create-space]
          (create-space-api req act)

        [%spaces %edit-space]
          (edit-space-api req act)

        [%spaces %delete-space]
          (delete-space-api req act)
      ==

    ::  ARM: ++  handle-channel-poke
    ::  ~lodlev-migdev - handle actions coming in from eyre channeling mechanism
    ::
    ::   @see: https://urbit-org-j1prh9inz-urbit.vercel.app/docs/arvo/eyre/external-api-ref
    ::    for more information
    ++  handle-channel-poke
      |=  [jon=json]

      `state

    ::*******************************************
    ::  ARM
    ::  ++  send-api-error
    ::  Send an http 500 error response that returns the incoming action payload
    ::   along with an error effect describing the nature of the error.
    ::  This method also logs to the ship's console for debugging purposes.
    ::
    ::  Note: 2nd parameter must be payload and not `action`. why? because
    ::   it is possible that the error was caused trying to parse the payload
    ::   into an action object. if this fails, there will be no action object
    ::   instance available.
    ++  send-api-error
      |=  [req=(pair @ta inbound-request:eyre) data=json msg=(unit @t)]

      ~&  >>>  msg

      =/  payload  ?:(?=([%o *] data) p.data ~)
      =/  res  (~(get by payload) 'resource')
      =/  res  ?~(res '?' (so:dejs:format (need res)))
      =/  action  (~(get by payload) 'action')
      =/  action  ?~(action '?' (so:dejs:format (need action)))
      =/  payload  (~(put by payload) 'action' s+(crip (weld (trip action) "-reaction")))

      =/  error-data=json
      %-  pairs:enjs:format
      :~
        ['error' s+?~(msg '?' (need msg))]
      ==

      =/  error-effect=json
      %-  pairs:enjs:format
      :~
        ['resource' s+res]
        ['effect' s+'error']
        ['data' error-data]
      ==

      =/  payload  (~(put by payload) 'effects' [%a [error-effect]~])

      =/  =response-header:http
        :-  500
        :~  ['Content-Type' 'application/json']
        ==

      ::  convert the string to a form that arvo will understand
      =/  data=octs
            (as-octs:mimes:html (crip (en-json:html [%o payload])))

      :_  state
      :~
        [%give %fact [/http-response/[p.req]]~ %http-response-header !>(response-header)]
        [%give %fact [/http-response/[p.req]]~ %http-response-data !>(`data)]
        [%give %kick [/http-response/[p.req]]~ ~]
      ==

    ++  create-space-api
      |=  [req=(pair @ta inbound-request:eyre) act=base-action]
      ^-  (quip card _state)

      ::  timestamp as unique key helper. should be good enough for demo purposes
      =/  timestamp  (en-json:html (time:enjs:format now.bowl))

      ::  ~lodlev-migdev
      ::  generate a key based on timestamp. since this is a demo agent,
      ::  this should suffice; but future production spaces agent will need
      ::  more robust mechanism for guarantee'ing uniqueness of space ids
      =/  space-id  (crip (weld "space-" timestamp))

      =/  space  (~(get by spaces.state) space-id)

      ::  if the space already exists (by id), respond with error
      ?.  =(space ~)
        =/  err  (crip "{<dap.bowl>}: error. space [{<space-id>}] exists")
        (send-api-error req (to-json act) (some err))

      ::  declare new space instance (defaults to null)
      =|  space=(map @t json)

      ::  convert payload data element to json object
      =/  space-data  ?:(?=([%o *] data.act) p.data.act ~)

      ::  merge action data with data in store
      =/  space  (~(gas by space) ~(tap by space-data))

      ::  grab parent space id from context. if it's null or doesn't exist
      ::  assume this is a root space (top-level)
      =/  parent-space-id  (~(get by context.act) 'parentSpaceId')

      ::  associate the parent space with this new space
      =/  space  (~(put by space) 'parentSpaceId' ?~(parent-space-id ~ (need parent-space-id)))

      ::  create the response
      =/  =response-header:http
        :-  200
        :~  ['Content-Type' 'application/json']
        ==

      ::  encode the response as a json string
      =/  body  (crip (en-json:html o+space))

      ::  convert the string to a form that arvo will understand
      =/  data=octs
            (as-octs:mimes:html body)

      :_  state(spaces (~(put by spaces.state) space-id [%o space]))

      :~
        [%give %fact [/http-response/[p.req]]~ %http-response-header !>(response-header)]
        [%give %fact [/http-response/[p.req]]~ %http-response-data !>(`data)]
        [%give %kick [/http-response/[p.req]]~ ~]
      ==

    ++  edit-space-api
      |=  [req=(pair @ta inbound-request:eyre) act=base-action]
      ^-  (quip card _state)

      ::  timestamp as unique key helper. should be good enough for demo purposes
      =/  timestamp  (en-json:html (time:enjs:format now.bowl))

      =/  space-id  (~(get by context.act) 'spaceId')
      ?~  space-id
        =/  err  (crip "{<dap.bowl>}: error. spaceId missing")
        (send-api-error req (to-json act) (some err))
      =/  space-id  (so:dejs:format (need space-id))

      ::  locate the space in the spaces store by id
      =/  space  (~(get by spaces.state) space-id)
      ::  if the space does not exists (by id), respond with error
      ?:  =(space ~)
        =/  err  (crip "{<dap.bowl>}: error. space [{<space-id>}] does not exists")
        (send-api-error req (to-json act) (some err))

      ::  grab json from unit (nullable type)
      =/  space  (need space)

      ::  convert space in store to json object
      =/  space  ?:(?=([%o *] space) p.space ~)

      ::  convert payload data element to json object
      =/  space-data  ?:(?=([%o *] data.act) p.data.act ~)

      ::  merge action data with data in store
      =/  space  (~(gas by space) ~(tap by space-data))

      ::  create the response
      =/  =response-header:http
        :-  200
        :~  ['Content-Type' 'application/json']
        ==

      ::  encode the response as a json string
      =/  body  (crip (en-json:html [%o space]))

      ::  convert the string to a form that arvo will understand
      =/  data=octs
            (as-octs:mimes:html body)

      :_  state(spaces (~(put by spaces.state) space-id [%o space]))

      :~
        [%give %fact [/http-response/[p.req]]~ %http-response-header !>(response-header)]
        [%give %fact [/http-response/[p.req]]~ %http-response-data !>(`data)]
        [%give %kick [/http-response/[p.req]]~ ~]
      ==

    ++  delete-space-api
      |=  [req=(pair @ta inbound-request:eyre) act=base-action]
      ^-  (quip card _state)

      ::  timestamp as unique key helper. should be good enough for demo purposes
      =/  timestamp  (en-json:html (time:enjs:format now.bowl))

      =/  space-id  (~(get by context.act) 'spaceId')
      ?~  space-id
        =/  err  (crip "{<dap.bowl>}: error. spaceId missing")
        (send-api-error req (to-json act) (some err))
      =/  space-id  (so:dejs:format (need space-id))

      ::  locate the space in the spaces store by id
      =/  space  (~(get by spaces.state) space-id)
      ::  if the space does not exists (by id), respond with error
      ?:  =(space ~)
        =/  err  (crip "{<dap.bowl>}: error. space [{<space-id>}] does not exists")
        (send-api-error req (to-json act) (some err))

      ::  grab json from unit (nullable type)
      =/  space  (need space)

      ::  create the response
      =/  =response-header:http
        :-  200
        :~  ['Content-Type' 'application/json']
        ==

      ::  encode the response as a json string
      =/  body  (crip (en-json:html space))

      ::  convert the string to a form that arvo will understand
      =/  data=octs
            (as-octs:mimes:html body)

      :_  state(spaces (~(del by spaces.state) space-id))

      :~
        [%give %fact [/http-response/[p.req]]~ %http-response-header !>(response-header)]
        [%give %fact [/http-response/[p.req]]~ %http-response-data !>(`data)]
        [%give %kick [/http-response/[p.req]]~ ~]
      ==
    --
::
++  on-leave  on-leave:def
::
++  on-watch
  |=  =path
  ^-  (quip card _this)

  ?+  path  (on-watch:def path)

      [%http-response *]
        %-  (slog leaf+"{<dap.bowl>}: client subscribed to {(spud path)}." ~)
        `this

  ==
::
++  on-peek  on-peek:def
::
++  on-agent  on-agent:def
::
++  on-arvo
  |=  [=wire =sign-arvo]
  ^-  (quip card _this)

  %-  (slog leaf+"{<dap.bowl>}: on-arvo called {<wire>}, {<sign-arvo>}..." ~)

  ?+  wire  (on-arvo:def wire sign-arvo)

    [%bind-route ~]
      ?>  ?=([%eyre %bound *] sign-arvo)
      ?:  accepted.sign-arvo
        %-  (slog leaf+"{<dap.bowl>}: {<[wire sign-arvo]>}" ~)
        `this
        %-  (slog leaf+"{<dap.bowl>}: binding route failed" ~)
      `this

  ==
::
++  on-fail   on-fail:def
--