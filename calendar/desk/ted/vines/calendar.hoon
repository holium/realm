/-  spider, *calendar, p=pools, b=boxes
/+  *ventio
=,  strand=strand:spider
^-  thread:spider
|=  arg=vase
=/  m  (strand ,vase)
^-  form:m
::
=/  req=(unit [ship request])  !<((unit [ship request]) arg)
?~  req  (strand-fail %no-arg ~)
=/  [src=ship vid=vent-id =mark =noun]  u.req
;<  =vase         bind:m  (unpage mark noun)
;<  =bowl:spider  bind:m  get-bowl
=/  [our=ship now=@da eny=@uvJ byk=beak]  [our now eny byk]:bowl
::
;<  ~  bind:m  (trace %running-calendar-vine ~)
::
|^
?+    mark  (punt [our %calendar] mark vase) :: poke normally
    %calendar-async-create
  =+  !<(axn=async-create vase)
  ?-    -.axn
      %calendar
    :: Only you can create a calendar in your own name
    ::
    ?>  =(src our)
    :: Create a pool in %pools and retrieve the pool id
    ::
    =/  =cage  pools-create-command+!>([title.axn ~ graylist.axn])
    ;<  vnt=pools-vent:p  bind:m  ((vent pools-vent:p) [our %pools] cage)
    =/  =id:p  ?>(?=(%id -.vnt) id.vnt)
    ;<  ~  bind:m  (trace (crip "id is {(spud /(scot %p host.id)/[name.id])}") ~)
    :: Poke %calendar to create a calendar with the new pool
    ::
    =/  =^cage  calendar-action+!>([id %create [title description roles]:axn])
    ;<  ~  bind:m  (poke [our %calendar] cage)
    :: Return the pool id, which doubles as the calendar id
    ::
    (pure:m !>(cid+id))
    ::
      %event
    :: Get unique event id
    ::
    =/  =eid  (unique-event-eid cid.axn)
    =/  =aid  (scot %uv (sham eny))
    =/  =mid  (scot %uv (sham eny))
    :: Poke %calendar to create an event
    ::
    =/  =^cage
      event-action+!>([[cid.axn eid] %create [dom aid rid kind args mid meta]:[axn .]])
    ;<  ~  bind:m  (poke [our %calendar] cage)
    :: Return the pool id, which doubles as the calendar id
    ::
    (pure:m !>(eid+eid))
    ::
      %event-until
    :: Get unique event id
    ::
    =/  =eid  (unique-event-eid cid.axn)
    =/  =aid  (scot %uv (sham eny))
    =/  =mid  (scot %uv (sham eny))
    :: Poke %calendar to create an event
    ::
    =/  =^cage
      event-action+!>([[cid.axn eid] %create [start until aid rid kind args mid meta]:[axn .]])
    ;<  ~  bind:m  (poke [our %calendar] cage)
    :: Return the pool id, which doubles as the calendar id
    ::
    (pure:m !>(eid+eid))
    ::
      %event-rule
    :: Get unique arguments id
    ::
    =/  =aid  (unique-event-aid [cid eid]:axn)
    :: Poke %calendar to create a event rule
    ::
    =/  =^cage
      event-action+!>([[cid eid] %create-rule aid rid kind args]:[axn .])
    ;<  ~  bind:m  (poke [our %calendar] cage)
    :: Return the pool id, which doubles as the calendar id
    ::
    (pure:m !>(aid+aid))
    ::
      %event-metadata
    :: Get unique metadata id
    ::
    =/  =mid  (unique-event-mid [cid eid]:axn)
    :: Poke %calendar to create a event metadata
    ::
    =/  =^cage
      event-action+!>([[cid eid] %create-metadata mid meta]:[axn .])
    ;<  ~  bind:m  (poke [our %calendar] cage)
    :: Return the pool id, which doubles as the calendar id
    ::
    (pure:m !>(mid+mid))
  ==
  ::
    %boxes-async-invite
  :: only you can send invite on your behalf
  ::
  ?>  =(src our)
  =/  [=cid =ship msg=@t]  !<(async-invite:b vase)
  :: send actual invite from host
  ::
  =+  boxes-invite-action+!>([cid %invite ship])
  ;<  *  bind:m  ((vent ,*) [host.cid %calendar] -)
  :: send a boxes invite gesture to the invitee
  ::
  =/  =invite:b  [our msg]
  =+  boxes-invite-gesture+!>([cid invite])
  ;<  ~  bind:m  (poke [ship %calendar] -)
  :: process your sent invite
  :: 
  =+  boxes-process+!>([cid %invite ship invite])
  ;<  ~  bind:m  (poke [our %calendar] -)
  (pure:m !>(~))
  ::
    %boxes-invite-action
  =+  !<(axn=invite-action:b vase)
  ?-    -.q.axn
      %invite
    :: only an admin can invite new members
    ::
    ?>  (is-admin p.axn src)
    =/  =cage  pools-invite-command+!>([p %invite ship.q]:axn)
    ;<  ~  bind:m  ((vent ,~) [our %pools] cage)
    (pure:m !>(~))
    ::
      %cancel
    :: only an admin or the inviter can cancel an invite
    ::
    =/  =invite:b  (~(got by outgoing-invites:boxes) [p ship.q]:axn)
    ?>  |((is-admin p.axn src) =(src inviter.invite))
    :: forward to %pools
    ::
    =/  =cage  pools-invite-command+!>([p.axn %cancel ship.q.axn])
    ;<  a=*  bind:m  ((vent *) [our %pools] cage)
    (pure:m !>(~))
    ::
      %kick
    :: only the host can kick admins
    :: only an admin can kick members
    ::
    ?>  ?:  (is-admin p.axn ship.q.axn)
          =(src host.p.axn)
        (is-admin p.axn src)
    :: forward to %pools
    ::
    =/  =cage  pools-invite-command+!>([p.axn %kick ship.q.axn])
    ;<  a=*  bind:m  ((vent *) [our %pools] cage)
    :: kick from calendar path
    ::
    =+  boxes-process+!>([p.axn %kick ship.q.axn])
    ;<  ~  bind:m  (poke [our %calendar] -)
    (pure:m !>(~))
    ::
      %accept
    :: only you can accept an invite
    ::
    ?>  =(src our)
    :: forward to %pools (invite gesture will be fully sent and
    :: procesed when this is done)
    ::
    =/  =cage  pools-invite-command+!>([p.axn %accept ~])
    ;<  a=*  bind:m  ((vent *) [our %pools] cage)
    :: watch the calendar
    ::
    ;<  ~  bind:m
      (poke [our %calendar] boxes-process+!>([p.axn %watch ~]))
    (pure:m !>(~))
    ::
      %reject
    :: only you can accept an invite
    ::
    ?>  =(src our)
    :: forward to %pools
    ::
    =/  =cage  pools-invite-command+!>([p.axn %reject ~])
    ;<  a=*  bind:m  ((vent *) [our %pools] cage)
    (pure:m !>(~))
  ==
  ::
    %boxes-join-action
  =+  !<(axn=join-action:b vase)
  ?-    -.q.axn
      %join
    :: TODO: test this
    :: only you can join on your behalf
    ::
    ?>  =(src our)
    :: listen to %pools /home for a new %pool update
    ::
    ;<  ~  bind:m  (watch /home [our %pools] /home)
    :: send the join as a %request
    ::
    =/  =cage  pools-request-command+!>([p.axn %request ~])
    ;<  *  bind:m  ((vent ,*) [our %pools] cage)
    :: take a pool update for the calendar id
    ::
    ;<  *  bind:m
      %-  (take-special-fact /home %pools-home-update home-update:p)
      |=(upd=home-update:p =([%pool %& p.axn] upd))
    :: watch the calendar
    ::
    ;<  ~  bind:m
      (poke [our %calendar] boxes-process+!>([p.axn %watch ~]))
    (pure:m !>(~))
    ::
      %leave
    :: only you can leave on your behalf
    ::
    ?>  =(src our)
    =/  =cage  pools-request-command+!>([p.axn %leave ~])
    ;<  *  bind:m  ((vent ,*) [our %pools] cage)
    :: leave the calendar
    ::
    ;<  ~  bind:m
      (poke [our %calendar] boxes-process+!>([p.axn %leave ~]))
    (pure:m !>(~))
  ==
  ::
    %event-action
  =+  !<(axn=event-action:b vase)
  ?+    -.q.axn  (punt [our %calendar] mark vase) :: poke normally
      %create-rule
    !!
  ==
==
::
++  sour  (scot %p our)
++  snow  (scot %da now)
::
++  unique-event-eid
  |=  =cid
  ^-  eid
  =/  cal=calendar  (~(got by calendars) cid)
  |-  =/  =eid  (scot %uv (sham eny))
  ?.  (~(has in ~(key by events.cal)) eid)
    eid
  $(eny +(eny))
::
++  unique-event-aid
  |=  [=cid =eid]
  ^-  aid
  =/  ven=event  (~(got by events:(~(got by calendars) cid)) eid)
  |-  =/  =aid  (scot %uv (sham eny))
  ?.  (~(has in ~(key by rules.ven)) aid)
    aid
  $(eny +(eny))
::
++  unique-event-mid
  |=  [=cid =eid]
  ^-  mid
  =/  ven=event  (~(got by events:(~(got by calendars) cid)) eid)
  |-  =/  =mid  (scot %uv (sham eny))
  ?.  (~(has in ~(key by metadata.ven)) mid)
    mid
  $(eny +(eny))
::
++  calendars
  ^-  (map cid calendar)
  =/  =peek
    .^  peek  %gx
      /[sour]/calendar/[snow]/calendars/calendar-peek
    ==
  ?>(?=(%calendars -.peek) calendars.peek)
::
++  boxes
  ^-  boxes:b
  =-  ?>(?=(%boxes -.peek) boxes.peek)
  .^  peek=boxes-peek:b  %gx
    /[sour]/calendar/[snow]/boxes/noun
  ==
::
++  is-admin
  |=  [=cid =ship]
  ^-  ?
  =/  r=(unit role)
    (~(get by roles:(~(got by calendars) cid)) ship)
  |(=(ship host.cid) ?~(r %| =(%admin u.r)))
--
