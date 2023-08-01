/-  spider, *calendar-spaces
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
=/  [our=ship now=@da eny=@uvJ]  [our now eny]:bowl
::
|^
?+    mark  (punt [our %calendar-spaces] mark vase) :: poke normally
    %spaces-async-create
  =+  !<(axn=async-create vase)
  ?-    -.axn
      %space
    :: assert not banned from creating
    ::
    =/  [=banned =calendars]  (~(got by almanac) space.axn)
    ?<  (~(has in banned) src)
    :: poke %calendar to create calendar
    ::
    =/  =cage
      :-  %calendar-async-create  !>
      :*  %calendar  title.axn  description.axn
          `[%calendar-spaces /roles-gate]
          `[%calendar-spaces /graylist-gate]
      ==
    ;<  vnt=cals-vent  bind:m  ((vent cals-vent) [our %calendar] cage)
    =/  =cid  ?>(?=(%cid -.vnt) cid.vnt)
    :: poke %calendar-spaces (self)
    ::
    =/  =^cage  spaces-crud-action+!>([space.axn %create cid perms.axn])
    ;<  *  bind:m  ((vent *) [our %calendar-spaces] cage)
    ::
    :: return calendar id
    ::
    (pure:m !>(cid+cid))
    ::
      %our
    :: only you can create in our
    ::
    ?>  =(src our)
    :: poke %calendar to create calendar
    ::
    =/  =cage
      :-  %calendar-async-create  !>
      [%calendar title.axn description.axn ~ ~]
    ;<  vnt=cals-vent  bind:m  ((vent cals-vent) [our %calendar] cage)
    ::
    ;<  ~  bind:m  (trace (scot %da now.bowl) ~)
    =/  =cid  ?>(?=(%cid -.vnt) cid.vnt)
    :: poke %calendar-spaces (self)
    ::
    =/  =^cage  spaces-process-our+!>([cid %put])
    ;<  a=*  bind:m  ((vent *) [our %calendar-spaces] cage)
    ::
    :: return calendar id
    ::
    (pure:m !>(cid+cid))
  ==
  ::
    %spaces-our-action
  :: only you can manipulate our
  ::
  ?>  =(src our)
  =+  !<(axn=our-action vase)
  ?-    q.axn
      %delete
    =/  =cage  spaces-process-our+!>([p.axn %del])
    ;<  a=*  bind:m  ((vent *) [our %calendar-spaces] cage)
    ?.  =(our host.p.axn)  (pure:m !>(~))
    =/  =^cage  calendar-action+!>([p.axn %delete ~])
    ;<  a=*  bind:m  ((vent *) [our %calendar] cage)
    (pure:m !>(~))
    ::
      %accept
    =/  =cage  boxes-invite-action+!>([p.axn %accept ~])
    ;<  a=*  bind:m  ((vent *) [our %calendar] cage)
    =/  =^cage  spaces-process-our+!>([p.axn %put])
    ;<  a=*  bind:m  ((vent *) [our %calendar-spaces] cage)
    (pure:m !>(~))
    ::
      %leave
    =/  =cage  boxes-join-action+!>([p.axn %leave ~])
    ;<  a=*  bind:m  ((vent *) [our %calendar] cage)
    =/  =^cage  spaces-process-our+!>([p.axn %del])
    ;<  a=*  bind:m  ((vent *) [our %calendar-spaces] cage)
    (pure:m !>(~))
  ==
==
++  sour  (scot %p our)
++  snow  (scot %da now)
::
++  almanac
  ^-  (map space [=banned =calendars])
  =/  pyk=spaces-peek
    .^  spaces-peek  %gx
      /[sour]/calendar-spaces/[snow]/almanac/spaces-peek
    ==
  ?>(?=(%almanac -.pyk) almanac.pyk)
--
