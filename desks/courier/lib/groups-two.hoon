/-  notify, chat
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
    ~
      [%x %dms %group @ @ ~]    ::  ~/scry/courier/dms/group/~dev/~2022.8.28..20.32.55.json
    ~&  i.t.t.t.path
    =/  entity           `@p`(slav %p i.t.t.t.path)
    =/  timestamp        `@t`i.t.t.t.t.path
    =/  whom             [%ship entity]
    ::  find a way to get the count
    =/  groups-two-path  /(scot %p our.bowl)/chat/(scot %da now.bowl)/chat/dm/0v4.00000.qcg10.qk70o.idqbo.qjuv7/writs/newest/1/noun
    ~&  groups-two-path
    ``graph-dm-view+!>(.^(writs:chat %gx groups-two-path))
      [%x %dms @ ~]             ::  ~/scry/courier/dms/~dev.json
    ~
  ==
:: TODO on-agent
--
