/-  notify, c=chat, dm-hook-sur=dm-hook
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
++  accept-dm
  |=  [=action:dm-hook-sur =bowl:gall]
  ^-  (list card:agent:gall)
  ?-  -.action
    %pendings  !!
    %screen  !!
    %decline
      [%pass / %agent [our.bowl %chat] %poke dm-rsvp+!>([+.action %.n])]~
    %accept
      :~
        [%pass / %agent [our.bowl %chat] %poke dm-rsvp+!>([+.action %.y])]
        :: watch the new chat channel that we accepted
        [%pass /g2/dm/ui %agent [our.bowl %chat] %watch /dm/(scot %p +.action)/ui]
      ==
  ==
++  handle-dm-ui-fact
  |=  [=cage =bowl:gall]
  ^-  (list card:agent:gall)
  ~&  'groups-two /dm/ui fact'
  ?+  p.cage  ~
    %writ-diff
      =/  diff  !<(diff:writs:c q.cage)
      =/  originating-ship  ^-(ship p.p.diff)
      =/  newest-msg  .^(writs:c %gx /(scot %p our.bowl)/chat/(scot %da now.bowl)/dm/(scot %p originating-ship)/writs/newest/1/noun)
      =/  new-dm  ^-  chat
      :*
        path=(spat /dm-inbox/(scot %p originating-ship))
        to=(~(put in *(set ^ship)) originating-ship)
        type=%dm
        source=%talk
        messages=(messages-from-writs newest-msg)
        metadata=~[(form-contact-mtd (get-rolo bowl) originating-ship)]
      ==
      ~&  >  'giving /updates a dm-received'
      ~&  >  new-dm
      [%give %fact [/updates ~] graph-dm-reaction+!>([%dm-received new-dm])]~
  ==
++  on-graph-action
  |=  [act=action bowl=[our=ship now=@da]]
  ~&  -.act
  |^
  ?-  -.act
    %send-dm               (send-dm +.act)
    %read-dm               (read-dm +.act bowl)
    %create-group-dm       (create-group-dm +.act bowl)
    %send-group-dm         (send-group-dm +.act)
    %read-group-dm         (read-group-dm +.act bowl)
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
    |=  [=ship bowl=[our=ship now=@da]]
    ~&  %read-dm
    ~&  ship
    :~
      [%pass / %agent [our.bowl %chat] %poke chat-remark-action+!>((create-chat-remark-action-from-ship ship))]
    ==
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
    |=  [=resource bowl=[our=ship now=@da]]
    ~&  %read-group-dm
    ~&  resource
    :~
      [%pass / %agent [our.bowl %chat] %poke chat-remark-action+!>((create-chat-remark-action-from-resource resource))]
    ==
  --
++  test-scry
  |=  [a=@ =bowl:gall]
  =/  =briefs:c
    .^(briefs:c %gx /(scot %p our.bowl)/chat/(scot %da now.bowl)/briefs/noun)
  ~&  briefs
  =/  s=(set ship)
    .^((set ship) %gx /(scot %p our.bowl)/chat/(scot %da now.bowl)/dm/noun)
  ~&  s
  =/  s2=(set ship)
    .^((set ship) %gx /(scot %p our.bowl)/chat/(scot %da now.bowl)/dm/invited/noun)
  ~&  s2
  =/  fs=(set flag:c)
    .^((set flag:c) %gx /(scot %p our.bowl)/chat/(scot %da now.bowl)/chat/noun)
  ~&  fs
  =/  =writs:writs:c
    .^(writs:writs:c %gx /(scot %p our.bowl)/chat/(scot %da now.bowl)/dm/(scot %p ~bus)/writs/newest/50/noun)
  ~&  writs
  ~
++  on-watch
  |=  [=path =bowl:gall]
  ?+  path      !!
    [%updates ~]
      =/  =briefs:c
        .^(briefs:c %gx /(scot %p our.bowl)/chat/(scot %da now.bowl)/briefs/noun)
      =/  dm-previews   (previews-from-briefs briefs bowl)
      ~&  'dm-previews in on-watch g2'
      ~&  dm-previews
      [%give %fact [/updates ~] graph-dm-reaction+!>([%previews dm-previews])]~
  ==
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
::++  writ-diff-to-courier-chat
::  |=  [=diff:writs:c]
::  ^-  chat
::  =/  
:::*
::  path=(spat /dm-inbox/(scot %p other-ship))
::  to=(silt ~[other-ship])
::  type=%dm
::  source=%talk
::  messages=~
::  metadata=~
::==
++  messages-with
  |=  [=ship =bowl:gall]
  ^-  chat
  =/  rolo  (get-rolo bowl)
  =/  dmed
    .^((set ^ship) %gx /(scot %p our.bowl)/chat/(scot %da now.bowl)/dm/noun)
  =/  =writs:c
    ?.  (~(has in dmed) ship)  *writs:c
    .^(writs:c %gx /(scot %p our.bowl)/chat/(scot %da now.bowl)/dm/(scot %p ship)/writs/newest/999/noun)
  ~&  (messages-from-writs writs)
  :*
    path=(spat /dm-inbox/(scot %p ship))
    to=(~(put in *(set ^ship)) ship)
    type=%dm
    source=%talk
    messages=(flop (messages-from-writs writs))
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
++  previews-from-briefs
  |=  [=briefs:c =bowl:gall]
  ^-  (list message-preview)
  =/  wrapped-briefs  (~(run by briefs) |=([v=brief:briefs:c] [brief=v bowl=bowl]))
  =/  prev-map        (~(rut by wrapped-briefs) preview-from-wrapped-brief)  
  %:  murn
    ~(val by prev-map)
    |=([u=(unit message-preview)] u)
  ==
++  preview-from-wrapped-brief
  |=  [=whom:c [=brief:briefs:c =bowl:gall]]
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
    :*  path=(spat /(scot %p our.bowl)/(scot %uv p.whom))
    ::(spat /(scot %p entity)/(cord name))
        to=team.crew
        type=%group
        source=%talk
        last-time-sent=last.brief
        last-message=~
        metadata=meta
        invite-id=~
        unread-count=count.brief
    ==
      %ship
    :-  ~
    :*  path=(spat /dm-inbox/(scot %p p.whom))
        to=(~(put in *(set ship)) p.whom)
        type=%dm
        source=%talk
        last-time-sent=last.brief
        last-message=(get-newest-msg-as-list-content p.whom bowl)
        metadata=~[(form-contact-mtd rolo p.whom)]
        invite-id=~
        unread-count=count.brief
    ==
  ==
++  get-newest-msg-as-list-content
  |=  [=ship =bowl:gall]
  ~&  %get-newest-msg-as-list-content
  ^-  (list content)
  =/  newest-msg-list  .^(writs:c %gx /(scot %p our.bowl)/chat/(scot %da now.bowl)/dm/(scot %p ship)/writs/newest/1/noun)
  =/  newest-msg  (snag 0 (tap:on:writs:c newest-msg-list))
  =/  memo  ^-(memo:c +.+.newest-msg)
  (transform-content content.memo author.memo)

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
++  create-chat-remark-action-from-ship
    |=  [=ship]
    ^-  remark-action:c
    [^-(whom:c [%ship ship]) ^-(remark-diff:c [%read ~])]
++  create-chat-remark-action-from-resource
    |=  [=resource]
    ^-  remark-action:c
    =/  club-id-unit  `(unit @uvH)`((slat %uv) `@t`name.resource)
    ?~  club-id-unit  !!
    [^-(whom:c [%club +:club-id-unit]) ^-(remark-diff:c [%read ~])]
++  propagate-briefs-fact
    |=  [cg=cage =bowl:gall]
    ^-  (list card:agent:gall)
    ?+  p.cg   !!
      %chat-brief-update
::[ %fact
::    cage
::  [ p=%chat-brief-update
::      q
      :: [whom:c brief:briefs:c]
::    [ #t/[?([%club p=@uvH] [%flag p=[p=@p q=@tas]] [%ship p=@p]) last=@da count=@ud read-id=u([p=@p q=@da])]
::      q=[[1.885.956.211 182] 170.141.184.505.963.463.907.794.262.005.666.283.520 0 0 0 170.141.184.505.963.463.907.794.262.005.666.283.520]
::    ]
::  ]
::]
        =/  the-fact      !<([whom:c brief:briefs:c] q.cg)
        =/  the-preview   (preview-from-wrapped-brief -.the-fact [+.the-fact bowl])
        ~&  >  'the-preview in propagate-briefs-fact'
        ~&  >  the-preview
        ?~  the-preview  ~
        [%give %fact [/updates ~] graph-dm-reaction+!>([%previews [+.the-preview ~]])]~
    ==
++  form-pending
  |=  [=ship now=@da rolo=rolodex]
  ^-  message-preview
  =/  path              (spat /dm-inbox/(scot %p ship))
  [path (silt ~[ship]) %pending %talk now [~] ~[(form-contact-mtd rolo ship)] ~ 0]
--
