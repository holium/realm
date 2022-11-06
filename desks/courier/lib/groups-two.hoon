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
    ~&  "G2 Peek"
    ~&  path
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
    ~
  ==
++  previews-from-briefs
  |=  [=briefs:c =bowl:gall]
  ^-  (list message-preview)
  =/  whoms=(list whom:c)
    ~(tap in ~(key by briefs))
  ::  just individual & group DMs, not channels
  =/  peeps
    (skip whoms |=(=whom:c =(-.whom %flag)))
  %+  turn  peeps
    |=  =whom:c
    ?-  -.whom
        %flag
      ::  these are filtered out above
      !!
        %club
      =/  =crew:club:c
        .^(crew:club:c %gx /(scot %p our.bowl)/chat/(scot %da now.bowl)/club/(scot %uvh p.whom)/crew/noun)
        ~&  crew
      :*  path=`@t`(scot %uvh p.whom)
          to=team.crew
          type=%group
          source=%chatstead
          last-time-sent=*@da
          last-message=~
          metadata=~[[color=*@ux avatar=~ nickname=*@t]]
          invite-id=~
          unread-count=0
      ==
        %ship
      :*  path=(scot %p p.whom)
          to=(~(put in *(set ship)) p.whom)
          type=%dm
          source=%chatstead
          last-time-sent=*@da
          last-message=~
          metadata=~[[color=*@ux avatar=~ nickname=*@t]]
          invite-id=~
          unread-count=0
      ==
    ==
--
