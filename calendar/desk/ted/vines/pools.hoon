/-  spider, *pools
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
=/  [our=ship eny=@uvJ]  [our eny]:bowl
::
|^
?+    mark  (punt [our %pools] mark vase) :: poke normally
    %pools-create-command
  :: only you can command your own agent
  ::
  ?>  =(src our)
  =/  cmd=create-command  !<(create-command vase)
  =/  =id  ((unique-id pools) name.cmd)
  :: poke %pools to create pool with new id
  ::
  ;<  ~  bind:m  (trace %before-pools-crud ~)
  =/  cmd-cage=cage  pools-crud-command+!>([id %create [fields scry]:cmd])
  ;<  ~              bind:m  (poke [our %pools] cmd-cage)
  ;<  ~  bind:m  (trace %after-pools-crud ~)
  :: vent the id
  ::
  (pure:m !>(id+id))

    %pools-invite-command
  =/  cmd=invite-command  !<(invite-command vase)
  ?+    -.q.cmd  (punt [our %pools] mark vase) :: poke normally
      %invite
    :: only the host can invite
    ::
    ?>  =(our.bowl host.p.cmd)
    :: already-invited or already-members can't be invited
    ::
    =/  =pool  (~(got by pools) p.cmd)
    ?<  (~(has in members.pool) ship.q.cmd)
    ?<  (~(has by invited.pool) ship.q.cmd)
    =/  invitee=ship  ship.q.cmd
    :: send invite-gesture
    ::
    =/  ges=cage  pools-invite-gesture+!>([p.cmd %invite])
    ;<  ~         bind:m  (poke [invitee %pools] ges)
    :: process invite-sent
    ::
    =/  pro=cage  pools-process-reply+!>([p.cmd %invite-sent invitee])
    ;<  ~         bind:m  (poke [our %pools] pro)
    :: send positive ack
    ::
    (pure:m !>(~))

    ::
      %accept
    :: cannot accept non-existent or already-determined invite
    ::
    ?~  inv=(~(get by invites) p.cmd)  ~|(%no-invite-outstanding !!)
    ?^  q.u.inv  ~|(%invite-already-determined !!)
    :: send accept gesture
    ::
    =/  ges=cage  pools-invite-gesture+!>([p.cmd %accept])
    ;<  ~         bind:m  (poke [host.p.cmd %pools] ges)
    :: process invite-accepted
    ::
    =/  pro=cage  pools-process-reply+!>([p.cmd %invite-accepted ~])
    ;<  ~         bind:m  (poke [our %pools] pro)
    :: send positive ack
    ::
    (pure:m !>(~))
    ::
      %reject
    :: cannot reject non-existent or already-determined invite
    ::
    ?~  inv=(~(get by invites) p.cmd)  ~|(%no-invite-outstanding !!)
    :: send accept gesture
    ::
    =/  ges=cage  pools-invite-gesture+!>([p.cmd %reject])
    ;<  ~         bind:m  (poke [host.p.cmd %pools] ges)
    :: process invite-accepted
    ::
    =/  pro=cage  pools-process-reply+!>([p.cmd %invite-rejected ~])
    ;<  ~         bind:m  (poke [our %pools] pro)
    :: send positive ack
    ::
    (pure:m !>(~))
  ==
  ::
    %pools-request-command
  =/  cmd=request-command  !<(request-command vase)
  ?+    -.q.cmd  !!
      %request
    ?<  |((~(has by pools) p.cmd) (~(has by requests) p.cmd))
    :: send request-gesture
    ::
    =/  ges=cage  pools-request-gesture+!>([p.cmd %request])
    ;<  ~         bind:m  (poke [host.p.cmd %pools] ges)
    :: process request-sent
    ::
    =/  pro=cage  pools-process-reply+!>([p.cmd %request-sent ~])
    ;<  ~         bind:m  (poke [our %pools] pro)
    :: send positive ack
    ::
    (pure:m !>(~))
  ==
==
++  unique-id
  |=  pools=(map id pool)
  |=  name=@t
  |^  `id`(uniquify (tasify name))
  ++  uniquify
    |=  =term
    ^-  id
    ?.  (~(has by pools) [our term])
      [our term]
    =/  num=@t  (numb (end 4 eny))
    $(term (rap 3 term '-' num ~)) :: add random number to end
  ++  numb :: from numb:enjs:format
    |=  a=@u
    ?:  =(0 a)  '0'
    %-  crip
    %-  flop
    |-  ^-  ^tape
    ?:(=(0 a) ~ [(add '0' (mod a 10)) $(a (div a 10))])
  ++  tasify
    |=  name=@t
    ^-  term
    =/  =tape
      %+  turn  (cass (trip name))
      |=(=@t `@t`?~(c=(rush t ;~(pose nud low)) '-' u.c))
    =/  =term
      ?~  tape  %$
      ?^  f=(rush i.tape low)
        (crip tape)
      (crip ['x' '-' tape])
    ?>(((sane %tas) term) term)
  --
::
++  sour  (scot %p our.bowl)
++  snow  (scot %da now.bowl)
::
++  pools
  ^-  (map id pool)
  =/  =peek
    .^  peek  %gx
      /[sour]/pools/[snow]/pools/pools-peek
    ==
  ?>(?=(%pools -.peek) pools.peek)
::
++  invites
  ^-  (map id (pair time (unit ?)))
  =/  =peek
    .^  peek  %gx
      /[sour]/pools/[snow]/invites/pools-peek
    ==
  ?>(?=(%invites -.peek) invites.peek)
::
++  requests
  ^-  (map id (pair time (unit ?)))
  =/  =peek
    .^  peek  %gx
      /[sour]/pools/[snow]/requests/pools-peek
    ==
  ?>(?=(%requests -.peek) requests.peek)
--
