/-  notify, c=chat
/-  *courier
|%
++  into-chat-inline-type
  |=  con=content
  ?-  -.con
    %text       text.con
    %mention    [%ship p=ship.con]
    %url        [%link p=url.con q=url.con]
    %code       [%code p=expression.con]
    %reference  [%break ~] ::TODO actually map this properly
  ==
++  on-graph-action
  |=  [act=action]
  |^
  ?-  -.act
    %send-dm               (send-dm +.act)
    %read-dm               (read-dm +.act)
    %create-group-dm       (create-group-dm +.act)
    %send-group-dm         (send-group-dm +.act)
    %read-group-dm         (read-group-dm +.act)
  ==
  ++  send-dm
    |=  [=ship p=post]
    ~&  %send-dm
    =/  inlines
      ^-  (list inline:c)
      (turn contents.p into-chat-inline-type)
    =/  delta-for-chat   [%add (memo:c ~ author.p time-sent.p [%story [*(list) (snoc inlines [%break ~])]])]
    =/  diff-for-chat    [[ship time-sent.p] delta-for-chat]
    ~&  "diff format for %chat agent:"
    ~&  diff-for-chat
    :~
      [%pass / %agent [author.p %chat] %poke dm-action+!>([ship diff-for-chat])]
    ==
  ++  read-dm
    |=  [=ship]
    ~&  ship
    ~
  ++  create-group-dm
    |=  [ships=(set ship)]
    ~&  ships
    ~
  ++  send-group-dm
    |=  [=resource =post]
    ~&  resource
    ~&  post
    ~
  ++  read-group-dm
    |=  [=resource]
    ~&  resource
    ~
  --
++  on-watch
  |=  =path
  ~
++  peek
  |=  [=path =bowl:gall =devices:notify]
  ^-  (unit (unit cage))
    ?>  =(our.bowl src.bowl)
    ?+  path  !!
      [%x %devices ~]
        ~&  "peeking devices on groups-two"
    ``notify-view+!>([%devices devices])
      [%x %dms ~]
    :: Get DMs from x/briefs scy
    =/  =briefs:c
      .^(briefs:c %gx /(scot %p our.bowl)/chat/(scot %da now.bowl)/briefs/noun)
    ``graph-dm-view+!>([%inbox (previews-from-briefs briefs bowl)])
      [%x %dms %group @ @ ~]    ::  ~/scry/courier/dms/group/~dev/~2022.8.28..20.32.55.json
    ~
      [%x %dms @ ~]             ::  ~/scry/courier/dms/~dev.json
    ``graph-dm-view+!>([%dm-log (messages-with `@p`(slav %p i.t.t.path) bowl)])
  ==
++  messages-with
  |=  [=ship =bowl:gall]
  ^-  chat
  =/  rolo  (get-rolo bowl)
  =/  dmed
    .^((set ^ship) %gx /(scot %p our.bowl)/chat/(scot %da now.bowl)/dm/noun)
  =/  =writs:c
    ?.  (~(has in dmed) ship)  *writs:c
    .^(writs:c %gx /(scot %p our.bowl)/chat/(scot %da now.bowl)/dm/(scot %p ship)/writs/newest/999/noun)
  ~&  writs
  :*
    path=(spat /(scot %p ship))
    to=(~(put in *(set ^ship)) ship)
    type=%dm
    source=%chatstead
    messages=(messages-from-writs writs)
    metadata=~[(form-contact-mtd rolo ship)]
  ==
++  messages-from-writs
  |=  =writs:c
  ^-  (list graph-dm)
  %+  turn   (tap:on:writs:c writs)
  |=  [=time [=seal:c =memo:c]]
    :*  index=~[time]
        author=author.memo
        time-sent=time
        (transform-content content.memo author.memo)
    ==
++  transform-content
  |=  [cs=content:c author=ship]
  ^-  (list content)
  ?-  -.cs
      %notice
    ~[[%text (crip "{(trip pfix.p.cs)} {<author>} {(trip sfix.p.cs)}")]]
      %story
    %-  zing
    :~
      ::  block
      %+  turn  p.p.cs
        |=  =block:c
        ^-  content
        ?-  -.block
          %image  [%url src.block]
          ::  TODO handle references
          %cite   [%text '']
        ==
      ::  inline
      %+  turn  q.p.cs  inline-to-content
    ==
  ==
++  inline-to-content
  |=  =inline:c
  ^-  content
  ?@  inline
  [%text inline]
  ::  TODO recursively handle the formatting tags like %italics
  ?+  -.inline  [%text '...']
    %inline-code  [%text p.inline]
    %ship  [%mention p.inline]
    %code  [%text p.inline]
    %tag  [%text p.inline]
    %link  [%url p.inline]
    %break  [%text '']
  ==
++  previews-from-briefs
  |=  [=briefs:c =bowl:gall]
  ^-  (list message-preview)
  =/  whoms=(list whom:c)
    ~(tap in ~(key by briefs))
  %+  murn  whoms
    |=  =whom:c
    ^-  (unit message-preview)
    =/  rolo  (get-rolo bowl)
    ?-  -.whom
        %flag
      ~
        %club
      =/  =crew:club:c
        .^(crew:club:c %gx /(scot %p our.bowl)/chat/(scot %da now.bowl)/club/(scot %uvh p.whom)/crew/noun)
      =/  meta
        (turn ~(tap in team.crew) |=(=ship (form-contact-mtd rolo ship)))
      :-  ~
      :*  path=`@t`(scot %uvh p.whom)
          to=team.crew
          type=%group
          source=%chatstead
          last-time-sent=*@da
          last-message=~
          metadata=meta
          invite-id=~
          unread-count=0
      ==
        %ship
      :-  ~
      :*  path=(scot %p p.whom)
          to=(~(put in *(set ship)) p.whom)
          type=%dm
          source=%chatstead
          last-time-sent=*@da
          last-message=~
          metadata=~[(form-contact-mtd rolo p.whom)]
          invite-id=~
          unread-count=0
      ==
    ==
++  get-rolo
  |=  =bowl:gall
  ^-  rolodex
  .^(rolodex %gx /(scot %p our.bowl)/contact-store/(scot %da now.bowl)/all/noun)
++  form-contact-mtd
    |=  [rolo=rolodex =ship]
    ^-  contact-mtd
    =/  mtd       (~(get by rolo) ship)
    =/  avatar=(unit @t)
      ?~  mtd  (some '')
      avatar.u.mtd
    =/  color=@ux
      ?~  mtd  `@ux`(scan "0" hex:ag)
      color.u.mtd
    =/  nickname=@t
      ?~  mtd  ''
      nickname.u.mtd
    [color avatar nickname]
--
