/-  notify, c=chat
/-  *courier
/+  lib=courier
|%
++  into-chat-inline-type
  |=  con=content
  ^-  inline:c
  ?-  -.con
    %text       text.con
    %mention    [%ship p=ship.con]
    %url        [%link p=url.con q=url.con]
    %code       [%code p=expression.con]
    %reference  [%break ~] ::TODO actually map this properly
  ==
++  on-graph-action
  |=  [act=action bowl=[our=ship now=@da]]
  ~&  -.act
  |^
  ?-  -.act
    %send-dm               (send-dm +.act)
    %read-dm               (read-dm +.act)
    %create-group-dm       (create-group-dm +.act bowl)
    %send-group-dm         (send-group-dm +.act)
    %read-group-dm         (read-group-dm +.act)
  ==
  ++  send-dm
    |=  [=ship p=post]
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
    |=  [ships=(set ship) bowl=[our=ship now=@da]]
    ~&  %create-group-dm
    ~&  ships
    =/  to-set        (~(put in ships) our.bowl)
    =/  new-grp-prev  [
          path=(spat /(scot %p our.bowl)/(scot %uv now.bowl))
          to=to-set
          type=%group
          source=%talk
          last-time-sent=now.bowl
          last-message=[~]
          metadata=(get-metadata:gs:lib to-set our.bowl now.bowl)
          invite-hash=~
          unread-count=0
      ]
    :~
      [%pass / %agent [our.bowl %chat] %poke club-create+!>([id=`@uvH`now.bowl hive=ships])]
      [%give %fact [/updates ~] graph-dm-reaction+!>([%group-dm-created `message-preview`new-grp-prev])]
    ==
  ++  send-group-dm
    |=  [=resource =post]
    =/  club-id-unit  `(unit @uvH)`((slat %uv) `@t`name.resource)
    ?~  club-id-unit  !!
    :~
      [%pass / %agent [author.post %chat] %poke club-action+!>((create-club-action-from-courier-post +:club-id-unit post))]
    ==
  ++  read-group-dm
    |=  [=resource]
    ~&  resource
    ~
  --
++  on-watch
  |=  =path
  ~&  "groups-two on-watch called"
  ~
++  peek
  |=  [=path =bowl:gall =devices:notify]
  ^-  (unit (unit cage))
    ?>  =(our.bowl src.bowl)
    ~&  "peeking groups-two"
    ~&  path
    ?+  path  !!
      [%x %devices ~]
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
    source=%talk
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
          source=%talk
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
          source=%talk
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
++  create-club-action-from-courier-post
    |=  [id=@uvH =post]
    ~&  id
    ^-  action:club:c
    =/  inlines
      ^-  (list inline:c)
      (turn contents.post into-chat-inline-type)
    =/  delta-for-chat   [%add (memo:c ~ author.post time-sent.post [%story [*(list) (snoc inlines [%break ~])]])]
    =/  writ-diff  [[author.post time-sent.post] delta-for-chat]
    [id `diff:club:c`[0 `delta:club:c`[%writ writ-diff]]]
--
