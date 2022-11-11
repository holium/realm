/-  notify, c=chat
/-  *courier
|%
++  on-graph-action
  |=  =vase
  ~
++  on-watch
  |=  =path
  ~
++  peek
  |=  [=path =bowl:gall =devices:notify]
  ^-  (unit (unit cage))
    ?>  =(our.bowl src.bowl)
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
    source=%chatstead
    messages=(messages-from-writs writs)
    metadata=~[(form-contact-mtd rolo ship)]
  ==
++  messages-from-writs
  |=  =writs:c
  ^-  (list graph-dm)
  ~
++  previews-from-briefs
  |=  [=briefs:c =bowl:gall]
  ^-  (list message-preview)
  =/  whoms=(list whom:c)
    ~(tap in ~(key by briefs))
  ::  just individual & group DMs, not channels
  %+  murn  whoms
    |=  =whom:c
    ^-  (unit message-preview)
    =/  rolo  (get-rolo bowl)
    ?-  -.whom
        %flag
      ::  these are filtered out above
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
