::
/-  *notify, resource, ha=hark
/+  default-agent, verb, dbug, group, agentio
::
|%
+$  card  card:agent:gall
::
+$  provider-state  (map term provider-entry)
+$  provider-entry
  $:  notify-endpoint=@t
      binding-endpoint=@t
      auth-token=@t
      clients=(map ship binding=(unit @t))
      =whitelist
  ==
++  clear-interval  ~d7
::
+$  client-state
  $:  providers=(jug @p term)
  ==
::
+$  base-state-0
  $:  =provider-state
      =client-state
  ==
+$  base-state-2
  $:  notifications=(map uid notification)
      base-state-0
  ==
::
+$  state-0
  [%0 base-state-0]
::
+$  state-1
  [%1 base-state-0]
::
+$  state-2
  [%2 base-state-2]
+$  state-3
  [%3 base-state-2]
::
+$  versioned-state
  $%  state-0
      state-1
      state-2
      state-3
  ==
::
--
::
=|  state-3
=*  state  -
::
%-  agent:dbug
%+  verb  |
^-  agent:gall
::
=<
  |_  =bowl:gall
  +*  this  .
      def   ~(. (default-agent this %|) bowl)
      do    ~(. +> bowl)
      io    ~(. agentio bowl)
      pass  pass:io
  ::
  ++  on-init
    :_  this
    :~  (~(watch-our pass:io /hark) %hark /ui)
        (~(wait pass:io /clear) (add now.bowl clear-interval))
    ==
  ::
  ++  on-save   !>(state)
  ++  on-load
    |=  =vase
    ^-  (quip card _this)
    =/  old=(unit state-3)
      (mole |.(!<(state-3 vase)))  
    ?~  old
      on-init
    :_  this(state u.old)
    ?:  (~(has by wex.bowl) [/hark our.bowl %hark])
      ~
    ~[(~(watch-our pass:io /hark) %hark /ui)]
  ::
  ++  on-poke
    |=  [=mark =vase]
    ^-  (quip card _this)
    |^
    =^  cards  state
      ?+  mark  (on-poke:def mark vase)
        %notify-provider-action  (handle-provider-action !<(provider-action vase))
        %notify-client-action    (handle-client-action !<(client-action vase))
      ==
    [cards this]
    ::
    ++  handle-provider-action
      |=  act=provider-action
      ^-  (quip card _state)
      ?-  -.act
          %add
        ?>  (team:title our.bowl src.bowl)
        =/  new-entry=provider-entry
          :*  notify.act
              binding.act
              auth-token.act
              ~
              whitelist.act
          ==
        [~ state(provider-state (~(put by provider-state) service.act new-entry))]
      ::
          %remove
        ?>  (team:title our.bowl src.bowl)
        =/  entry=(unit provider-entry)  (~(get by provider-state) service.act)
        ?~  entry
          ~|("no such service: {<service.act>}" !!)
        :_  state(provider-state (~(del by provider-state) service.act))
        %+  turn  ~(tap by clients.u.entry)
        |=  [who=@p *]
        ^-  card
        (leave-path:pass [who %notify] /notify/(scot %p who)/[service.act])
      ::
          %client-join
        =/  entry=(unit provider-entry)  (~(get by provider-state) service.act)
        ?~  entry
          ~|("no such service: {<service.act>}" !!)
        ?.  (is-whitelisted:do src.bowl u.entry)
          ~|("permission denied" !!)
        =.  clients.u.entry  (~(put by clients.u.entry) src.bowl ~)
        =/  cards=(list card)
          :_  ~
          %:  register-binding:do
              service.act
              u.entry
              binding-endpoint.u.entry
              src.bowl
              address.act
          ==
        =/  =wire  /agentio-watch/notify/(scot %p src.bowl)/[service.act]
        =?  cards  !(~(has by wex.bowl) wire src.bowl %notify)
          :_  cards
          %+  watch:pass
            [src.bowl %notify]
          /notify/(scot %p src.bowl)/[service.act]
        :-  cards
        state(provider-state (~(put by provider-state) service.act u.entry))
      ::
          %client-leave
        =/  entry=(unit provider-entry)  (~(get by provider-state) service.act)
        ?~  entry
          ~|("no such service: {<service.act>}" !!)
        ?.  (is-client:do src.bowl u.entry)
          ~|("permission denied" !!)
        =/  client-info=(unit @t)  (~(got by clients.u.entry) src.bowl)
        =.  clients.u.entry        (~(del by clients.u.entry) src.bowl)
        :_  state(provider-state (~(put by provider-state) service.act u.entry))
        ?~  client-info
          :_  ~
          %+  leave-path:pass
            [src.bowl %notify]
          /notify/(scot %p src.bowl)/[service.act]
        :~  %:  remove-binding:do
                service.act
                u.entry
                src.bowl
                binding-endpoint.u.entry
                u.client-info
            ==
            %+  leave-path:pass
              [src.bowl %notify]
            /notify/(scot %p src.bowl)/[service.act]
        ==
      ==
    ::
    ++  handle-client-action
      |=  act=client-action
      ^-  (quip card _state)
      ?>  (team:title our.bowl src.bowl)
      ?-  -.act
          %connect-provider
        =.  providers.client-state
          (~(put ju providers.client-state) who.act service.act)
        =/  pact=provider-action  [%client-join service.act address.act]
        :_  state
        [(poke:pass [who.act %notify] %notify-provider-action !>(pact))]~
      ::
          %remove-provider
        =.  providers.client-state
          (~(del ju providers.client-state) who.act service.act)
        =/  pact=provider-action  [%client-leave service.act]
        :_  state
        [(poke:pass [who.act %notify] %notify-provider-action !>(pact))]~
      ==
    --
  ::
  ++  on-watch
    |=  =path
    ^-  (quip card _this)
    ?+  path  (on-watch:def path)
        [%notify @ @ ~]
      =*  service  i.t.t.path
      ?.  (~(has ju providers.client-state) src.bowl service)
        ~|("permission denied" !!)
      `this
    ==
  ::
  ++  on-leave
    |=  =path
    ^-  (quip card _this)
    `this
  ::
  ++  on-peek
    |=  =path
    ^-  (unit (unit cage))
    =/  =(pole knot)  path
    ?+  pole  [~ ~]
    ::
        [%x %note uid=@t ~]
      =/  =uid  (slav %ux uid.pole)
      =/  note=notification  (~(got by notifications) uid)
      ``hark-note+!>(note)
    ==
  ::
  ++  on-agent
    |=  [=wire =sign:agent:gall]
    ^-  (quip card _this)
    ?+  wire  (on-agent:def wire sign)
    ::
    ::  subscription from client to their own hark-store
    ::
        [%hark ~]
      ?+  -.sign  (on-agent:def wire sign)
          %fact
        ?.  ?=(%hark-action p.cage.sign)
          `this
        =+  !<(=action:ha q.cage.sign)
        =/  upd=(unit update)
          (filter-notifications:do action)
        :_  this
        ?~  upd  ~
        (drop (fact-all:io %notify-update !>(u.upd)))
      ::
          %kick
        :_  this
        [%pass wire %agent [our.bowl %hark] %watch /ui]~
      ==
    ::
    ::  subscription from provider to client
    ::
        [%agentio-watch %notify @ @ ~]
      =/  who      (slav %p i.t.t.wire)
      =*  service  i.t.t.t.wire
      ?+  -.sign  (on-agent:def wire sign)
          %fact
        ?>  ?=(%notify-update p.cage.sign)
        =+  !<(=update q.cage.sign)
        :_  this
        =/  entry=(unit provider-entry)  (~(get by provider-state) service)
        ?~  entry
          ~
        [(send-notification:do u.entry who update)]~
      ::
          %kick
        :_  this
        [(watch:pass [who %notify] /notify/(scot %p who)/[service])]~
      ::
          %watch-ack
        ?~  p.sign
          `this
        ((slog u.p.sign) `this)
      ==
    ==
  ::
  ++  on-arvo
    |=  [=wire =sign-arvo]
    ^-  (quip card _this)
    ?+  wire  (on-arvo:def wire sign-arvo)
        [%register-binding @ @ @ ~]
      =/  who=@p   (slav %p i.t.wire)
      =*  service  i.t.t.wire
      ::
      ?>  ?=(%iris -.sign-arvo)
      ?>  ?=(%http-response +<.sign-arvo)
      ?>  ?=(%finished -.client-response.sign-arvo)
      ?>  ?=(^ full-file.client-response.sign-arvo)
      =/  =mime-data:iris  u.full-file.client-response.sign-arvo
      ?>  =('application/json' type.mime-data)
      =/  jon=json
        (fall (rush (@t q.data.mime-data) apex:de-json:html) *json)
      =/  [sid=@t message=@t]
        %.  jon
        %-  ot:dejs:format
        :~  sid+so:dejs:format
            message+so:dejs:format
        ==
      ::
      =/  entry=(unit provider-entry)  (~(get by provider-state) service)
      :-  ~
      ?~  entry
        this
      =.  clients.u.entry  (~(put by clients.u.entry) who `sid)
      this(provider-state (~(put by provider-state) service u.entry))
    ::
        [%remove-binding *]  `this
    ::
        [%send-notification *]
      ?>  ?=(%iris -.sign-arvo)
      ?>  ?=(%http-response +<.sign-arvo)
      =*  res  client-response.sign-arvo
      ?>  ?=(%finished -.res)
      %.  `this  
      =*  status  status-code.response-header.res
      ?:  =(200 status)  same
      %+  slog  
        leaf/"Error sending notfication, status: {(scow %ud status)}"
      ?~  full-file.res  ~
      ~[leaf/(trip `@t`q.data.u.full-file.res)]
    ::
        [%clear ~]
      ?>  ?=([%behn %wake *] sign-arvo)
      =.  notifications  ~
      ~&  "notify/debug: cleared notifications"
      :_  this
      ~[(~(wait pass:io /clear) (add now.bowl clear-interval))]
    ==
  ::
  ++  on-fail   on-fail:def
  --
|_  bowl=bowl:gall
::
++  filter-notifications
  |=  =action:ha
  ^-  (unit update)
  ?.  ?=(%add-yarn -.action)  ~
  `[id.yarn.action %notify]
::
++  is-whitelisted
  |=  [who=@p entry=provider-entry]
  ^-  ?
  |^
  ?|  public.whitelist.entry
      =(our.bowl who)
      is-kid
      (~(has in users.whitelist.entry) who)
      in-group
  ==
  ::
  ++  is-kid
    ?&  kids.whitelist.entry
        =(our.bowl (sein:title our.bowl now.bowl who))
    ==
  ::
  ++  in-group
    =/  gs  ~(tap in groups.whitelist.entry)
    |-
    ?~  gs  %.n
    ?:  (~(is-member group bowl) who i.gs)
      %.y
    $(gs t.gs)
  --
::
++  is-client
  |=  [who=@p entry=provider-entry]
  ^-  ?
  (~(has by clients.entry) who)
::
++  post-form
  |=  [=wire url=@t auth=@t params=(list [@t @t])]
  ^-  card
  =/  esc=$-(@t @t)
    |=(t=@t (crip (en-urlt:html (trip t))))
  =.  params
    %+  turn  params
    |=  [p=@t q=@t]
    [(esc p) (esc q)]
  =/  data
    %+  roll
      %+  sort  params
      |=  [[p=@t @t] [q=@t @t]]
      (aor p q)
    |=  [[p=@t q=@t] out=_url]
    (rap 3 out p q ~)
  =/  hmac-sig  (hmac-sha1t:hmac:crypto auth data)
  =/  b64-sig   (en:base64:mimes:html (met 3 hmac-sig) (swp 3 hmac-sig))
  =/  headers
    :~  ['X-Twilio-Signature' b64-sig]
        ['Content-Type' 'application/x-www-form-urlencoded']
    ==
  =/  form-data  (build-form-data params)
  =/  =request:http
    [%'POST' url headers `[(met 3 form-data) form-data]]
  [%pass wire %arvo %i %request request *outbound-config:iris]
::
++  build-form-data
  |=  data=(list [@t @t])
  ^-  @t
  %+  roll  data
  |=  [[p=@t q=@t] out=@t]
  ?:  =(out '')
    (rap 3 p '=' q ~)
  (rap 3 out '&' p '=' q ~)
::
++  send-notification
  |=  [entry=provider-entry who=@p =update]
  ^-  card
  =/  params=(list [@t @t])
    :~  identity+(rsh [3 1] (scot %p who))
        action+`@t`action.update
        uid+(scot %uv uid.update)
    ==
  %:  post-form
      /send-notification/(scot %uv (sham eny.bowl))
      notify-endpoint.entry
      auth-token.entry
      params
  ==
::
++  register-binding
  |=  [service=term entry=provider-entry url=@t who=@p address=@t]
  ^-  card
  =/  params=(list [@t @t])
    :~  identity+(rsh [3 1] (scot %p who))
        bindingtype+'apn'
        address+address
        action+'add'
    ==
  %:  post-form
      /register-binding/(scot %p who)/[service]/(scot %uv (sham eny.bowl))
      binding-endpoint.entry
      auth-token.entry
      params
  ==
::
++  remove-binding
  |=  [service=term entry=provider-entry who=@p url=@t sid=@t]
  ^-  card
  =/  params=(list [@t @t])
    :~  sid+sid
        action+'remove'
    ==
  %:  post-form
      /remove-binding/(scot %p who)/[service]/(scot %uv (sham eny.bowl))
      binding-endpoint.entry
      auth-token.entry
      params
  ==
--
