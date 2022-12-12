/-  contact-store, agd-type=accept-group-dm
/-  notify, c=chat, dm-hook-sur=dm-hook
/-  *courier, *versioned-state
/+  lib=courier, notif-lib=notify
|%
++  into-chat-block-type
  |=  con=content
  ^-  (unit block:c)
  ?-  -.con
    %text       ~
    %mention    ~
    %url        ~
    %code       ~
    %reference
    =/  ref
    ?-  -.reference.con
      %graph  ~
      %group  `block:c`[%cite [%group group.reference.con]]
      %app    `block:c`[%cite [%desk flag=[ship.reference.con desk.reference.con] path.reference.con]]
    ==
    ~&  >>  ['into-chat-block-type' ref]
    ?~  ref  ~
    `ref
  ==
++  into-chat-inline-type
  |=  con=content
  ^-  inline:c
  ?-  -.con
    %text       text.con
    %mention    [%ship p=ship.con]
    %url        [%link p=url.con q=url.con]
    %code       [%code p=expression.con]
    %reference
    ?-  -.reference.con
      %graph  ''  
      %group  ''  :: [%group ship=@ name=@ ~]
      %app    ''  :: [%desk ship=@ name=@ rest=*]
    ==
  ==
++  textified-content
  |=  =content
  ^-  @t
  ?-  -.content
    %text       text.content
    %mention    (scot %p ship.content)
    %url        url.content
    %code       expression.content
    %reference
    ?-  -.reference.content
      %graph  name.group.reference.content
      %group  (crip (join ' ' `(list @t)`[(scot %p entity.group.reference.content) 'group called' name.group.reference.content ~]))
      %app    (crip (join '/' `(list @t)`['' (scot %p ship.reference.content) desk.reference.content path.reference.content]))
    ==
  ==
++  flat-crip-inline-list
  |=  [inlines=(list inline:c) pre=@t post=@t]
  ^-  @t
  =/  content-ified  (turn inlines inline-to-content)
  =/  flattened      [pre (turn content-ified textified-content)]
  (crip (join '' (weld flattened [post ~])))
++  inline-to-content
  |=  =inline:c
  ^-  content
  ?@  inline
  [%text inline]
  ?+  -.inline      [%text '...']
    %ship           [%mention p.inline]
    %link           [%url p.inline]
    %inline-code    [%code expression=p.inline output=*(list tank)]
    %code           [%code expression=p.inline output=*(list tank)]
    %tag            [%text p.inline]
    %break          [%text ''] :: TODO when ui handles newlines we will need to indicate them
    %italics        [%text (flat-crip-inline-list p.inline '_' '_')]
    %blockquote     [%text (flat-crip-inline-list p.inline '> ' '')]
    %bold           [%text (flat-crip-inline-list p.inline '**' '**')]
    %strike         [%text (flat-crip-inline-list p.inline '~~' '~~')]
  ==
::
++  into-contact-ship-add-card
  |=  [=ship =bowl:gall]
  :: TODO if tlon makes %contact-hook work instead of %contact-store,
  :: then we gotta poke that (unless they update %chat to do the rolodex
  :: updating for us) instead of this
  :: --- but currently, two ships using %talk cannot see each other's
  :: rolodex profile, even if it's public
  [%pass / %agent [our.bowl %contact-store] %poke contact-update-0+!>([%add ship *contact:contact-store])]
::
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
        (into-contact-ship-add-card +.action bowl)
        [%pass / %agent [our.bowl %chat] %poke dm-rsvp+!>([+.action %.y])]
        :: watch the new chat channel that we accepted
        [%pass /g2/dm/(scot %p +.action)/ui %agent [our.bowl %chat] %watch /dm/(scot %p +.action)/ui]
      ==
  ==
::
++  accept-group-dm
  |=  [a=action:agd-type =bowl:gall]
  ^-  (list card:agent:gall)
  =/  accepting  =(-.a %accept)
  ?.  accepting
    :~
      [%pass / %agent [our.bowl %chat] %poke club-action+!>([id.a [0 [%team ship=our.bowl ok=accepting]]])]
      :: because of automatically subscribing when we recieve invite, we
      :: also have to unsub here when rejecting invite
      [%pass /g2/club/(scot %uv id.a)/ui %agent [our.bowl %chat] %leave ~]
    ==
  =/  crew  (get-crew id.a bowl)
  =/  group-ships   (~(uni in team.crew) hive.crew)
  =/  new-grp-prev  [
        path=(spat /(scot %p our.bowl)/(scot %uv id.a))
        to=group-ships
        type=%group
        source=%talk
        last-time-sent=now.bowl
        last-message=[~]
        metadata=(get-metadata:gs:lib group-ships our.bowl now.bowl)
        invite-id=~
        unread-count=1
    ]
  =/  track-group-contact-cards
    (turn ~(tap in group-ships) |=(=ship (into-contact-ship-add-card ship bowl)))
  :*
    [%pass / %agent [our.bowl %chat] %poke club-action+!>([id.a [0 [%team ship=our.bowl ok=accepting]]])]
    :: watch the new chat channel that we accepted
    [%pass /g2/club/(scot %uv id.a)/ui %agent [our.bowl %chat] %watch /club/(scot %uv id.a)/ui/writs]
    [%give %fact [/updates ~] graph-dm-reaction+!>([%group-dm-created `message-preview`new-grp-prev])]
    track-group-contact-cards
  ==
++  handle-dm-invite
  |=  [=cage =bowl:gall]
  ^-  (list card:agent:gall)
  =/  possible-fact  !<(?(%~ [n=@p l=(set @p) r=(set @p)]) q.cage)
  =/  to-ship  -.possible-fact
  ::~&  >  "groups-two /dm/invited fact from {(scow %p to-ship)}"
  =/  the-invite      (form-pending to-ship now.bowl (get-rolo bowl))
  [%give %fact [/updates ~] graph-dm-reaction+!>([%invite-dm the-invite])]~
++  handle-club-invite
  |=  [=cage =bowl:gall]
  ^-  (list card:agent:gall)
  =/  invite  !<(invite:club:c q.cage)
  =/  to-set  (~(uni in team.invite) hive.invite)
  ::~&  >  "groups-two /club/new fact {(scow %uv id.invite)}"
  =/  new-grp-prev  [
        path=(spat /(scot %p our.bowl)/(scot %uv id.invite))
        to=to-set
        type=%group-pending
        source=%talk
        last-time-sent=now.bowl
        last-message=[~]
        metadata=(get-metadata:gs:lib to-set our.bowl now.bowl)
        invite-id=`id.invite
        unread-count=1
    ]
  :~
    [%pass /g2/club/(scot %uv id.invite)/ui %agent [our.bowl %chat] %watch /club/(scot %uv id.invite)/ui/writs]
    [%give %fact [/updates ~] graph-dm-reaction+!>([%group-dm-created `message-preview`new-grp-prev])]
  ==
++  handle-dm-ui-fact
  |=  [=cage =bowl:gall state=state-1]
  ^-  (list card:agent:gall)
  ::~&  >  "groups-two /dm/ui fact %{(scow %tas p.cage)}"
  ?+  p.cage  ~
    %writ-diff
      =/  diff  !<(diff:writs:c q.cage)
      =/  originating-ship  ^-(ship p.p.diff)
      ?:  =(originating-ship our.bowl)  ~
      =/  new-dm  (chat-from-newest-writ originating-ship bowl)
      (send-updates new-dm bowl state)
  ==
++  handle-club-ui-fact
  |=  [=wire =cage =bowl:gall state=state-1]
  ^-  (list card:agent:gall)
  ::~&  >  "groups-two /club/ui fact %{(scow %tas p.cage)}"
  ?+  p.cage  ~
    %writ-diff
      =/  club-id-unit  `(unit @uvH)`((slat %uv) `@t`-.+.+.wire)
      ?~  club-id-unit  ~
      =/  club-id       +:club-id-unit
      =/  diff  !<(diff:writs:c q.cage)
      =/  crew  (get-crew club-id bowl)
      =/  new-dm  (chat-from-crew club-id crew bowl)
      
      (send-updates new-dm bowl state)
  ==
++  on-graph-action
  |=  [act=action =bowl:gall state=state-1]
  |^
  ?-  -.act
    %send-dm               [(send-dm +.act) state]
    %read-dm               [(read-dm +.act bowl) state]
    %create-group-dm       [(create-group-dm +.act bowl) state]
    %send-group-dm         [(send-group-dm +.act bowl state) state]
    %read-group-dm         [(read-group-dm +.act bowl) state]
    %set-groups-target
      :-
      (set-groups-target +.act bowl)
      :: we do have to actually mutate the state here
      [%1 +.act +>:state]
  ==
  ++  send-dm
    |=  [=ship p=post]
    =/  inlines
      ^-  (list inline:c)
      (turn contents.p into-chat-inline-type)
    =/  blocks
      ^-  (list block:c)
      (murn contents.p into-chat-block-type)
    =/  delta-for-chat   [%add (memo:c ~ author.p time-sent.p [%story [blocks (snoc inlines [%break ~])]])]
    =/  chat-diff    [[ship time-sent.p] delta-for-chat]
    :: ~&  >>  ['send-dm here:' chat-diff]
    [%pass / %agent [author.p %chat] %poke dm-action+!>([ship chat-diff])]~
  ++  read-dm
    |=  [=ship =bowl:gall]
    ~&  >  "signaling read-dm for {(scow %p ship)}"
    =/  rop
      [
        gop=~ 
        can=~ 
        des=%talk 
        ted=[/dm/(scot %p ship)]
      ]
    :~
      [%pass / %agent [our.bowl %chat] %poke chat-remark-action+!>((create-chat-remark-action-from-ship ship))]
      [%pass / %agent [our.bowl %hark] %poke hark-action+!>([%saw-rope rop])]
    ==
  ++  create-group-dm
    |=  [ships=(set ship) =bowl:gall]
    ::~&  >  "creating group dm with "::{ships}
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
      :: watch the new club that we created
      [%pass /g2/club/(scot %uv now.bowl)/ui %agent [our.bowl %chat] %watch /club/(scot %uv now.bowl)/ui/writs]
    ==
  ::
  ++  send-group-dm
    |=  [act=[=resource =post] =bowl:gall state=state-1]
    =/  club-id-unit  `(unit @uvH)`((slat %uv) `@t`name.resource.act)
    ?~  club-id-unit  !!
    =/  crew          (get-crew +:club-id-unit bowl)
    =/  group-ships   (~(uni in team.crew) hive.crew)
    =/  messages  :_  ~
    :*  index=~[time-sent.post.act]
        author=our.bowl
        time-sent=time-sent.post.act
        contents.post.act
    ==
    =/  new-dm
    ^-  chat
    :*
      path=(spat /(scot %p our.bowl)/(scot %uv +:club-id-unit))
      to=group-ships
      type=?:((~(has in team.crew) our.bowl) %group %group-pending)
      source=%talk
      messages=messages
      metadata=(turn ~(tap in group-ships) |=([s=ship] (form-contact-mtd (get-rolo bowl) s)))
    ==
    ::~&  >  'giving /updates a dm-received'
    ::~&  >  new-dm
    :~
      [%pass / %agent [author.post.act %chat] %poke club-action+!>((create-club-action-from-courier-post +:club-id-unit post.act))]
    ==
  ++  read-group-dm
    |=  [=resource =bowl:gall]
    ~&  %read-group-dm
    ~&  resource
    =/  club-id-unit  `(unit @uvH)`((slat %uv) `@t`name.resource)
    ?~  club-id-unit  !!
    =/  rop
      [
        gop=~ 
        can=~ 
        des=%talk
        ted=[/club/(scot %uv +:club-id-unit)]
      ]
    :~
      [%pass / %agent [our.bowl %chat] %poke chat-remark-action+!>((create-chat-remark-action-from-resource resource))]
      [%pass / %agent [our.bowl %hark] %poke hark-action+!>([%saw-rope rop])]
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
  =/  mc=(map flag:c chat:c)
    .^((map flag:c chat:c) %gx /(scot %p our.bowl)/chat/(scot %da now.bowl)/chats/noun)
  ~&  mc
  ~&  (previews-for-inbox bowl)
::  =/  =writs:writs:c
::    .^(writs:writs:c %gx /(scot %p our.bowl)/chat/(scot %da now.bowl)/dm/(scot %p ~bus)/writs/newest/50/noun)
::  ~&  writs
  ~
++  on-watch
  |=  [=path =bowl:gall]
  ?+  path      !!
    [%updates ~]
      [%give %fact [/updates ~] graph-dm-reaction+!>([%previews (previews-for-inbox bowl)])]~
  ==
++  peek
  |=  [=path =bowl:gall =devices:notify]
  ^-  (unit (unit cage))
    ?>  =(our.bowl src.bowl)
    ::~&  "peeking groups-two"
    ::~&  path
    ?+  path  !!
      [%x %devices ~]
    ``notify-view+!>([%devices devices])
      [%x %dms ~]
    ``graph-dm-view+!>([%inbox (previews-for-inbox bowl)])
      [%x %dms %group @ @ ~]    ::  ~/scry/courier/dms/group/~dev/0v4.00000.qchdp.006ht.e2hte.2hte2.json
    ``graph-dm-view+!>([%dm-log (crew-messages `@uvH`(slav %uv i.t.t.t.t.path) bowl)])
      [%x %dms @ ~]             ::  ~/scry/courier/dms/~dev.json
    ``graph-dm-view+!>([%dm-log (messages-with `@p`(slav %p i.t.t.path) bowl)])
  ==
++  previews-for-inbox
  |=  [=bowl:gall]
  ^-  (list message-preview)
    :: Get DMs from x/briefs scy
  =/  =briefs:c    .^(briefs:c %gx /(scot %p our.bowl)/chat/(scot %da now.bowl)/briefs/noun)
    :: Get invited DMs from x/dm/invited scy
  =/  invited-dms  .^((set ship) %gx /(scot %p our.bowl)/chat/(scot %da now.bowl)/dm/invited/noun)
  =/  prevs        (weld (previews-from-briefs briefs bowl) (previews-from-ship-set invited-dms bowl))
  :: ~&  prevs
  prevs
++  crew-messages
  |=  [id=@uvH =bowl:gall]
  ^-  chat
  =/  rolo  (get-rolo bowl)
  =/  crew  (get-crew id bowl)
  =/  =writs:c  .^(writs:c %gx /(scot %p our.bowl)/chat/(scot %da now.bowl)/club/(scot %uv id)/writs/newest/999/noun)
  =/  group-ships  (~(uni in team.crew) hive.crew)
  :: ~&  writs
  :: ~&  (messages-from-writs writs)
  :*
    path=(spat /(scot %p our.bowl)/(scot %uv id))
    to=group-ships
    type=%group
    source=%talk
    messages=(flop (messages-from-writs writs))
    metadata=(turn ~(tap in group-ships) |=([s=ship] (form-contact-mtd rolo s)))
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
  :: ~&  (messages-from-writs writs)
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
  ::  BE WARNED time IS NOT AS PRECISE AS sent.memo
  |=  [=time [=seal:c =memo:c]]
    :*  index=~[sent.memo]
        author=author.memo
        time-sent=sent.memo
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
          %cite
          ?-  -.cite.block
            %chan   [%text '']
            %group  [%reference [%group flag.cite.block]]
            %desk   [%text '']
            %bait   [%text '']
          ==
        ==
      ::  inline
      %+  turn  q.p.cs  inline-to-content
    ==
  ==
++  previews-from-ship-set
  |=  [s=(set ship) =bowl:gall]
  ^-  (list message-preview)
  %:  turn
    ~(tap in s)
    |=([=ship] (ship-to-preview ship bowl))
  ==
++  ship-to-preview
  |=  [sh=ship =bowl:gall]
  ^-  message-preview
  :*  path=(spat /dm-inbox/(scot %p sh))
      to=(~(put in *(set ship)) sh)
      type=%pending
      source=%talk
      last-time-sent=now.bowl
      last-message=[~]
      metadata=~[(form-contact-mtd (get-rolo bowl) sh)]
      invite-id=~
      unread-count=0
  ==
++  previews-from-briefs
  |=  [=briefs:c =bowl:gall]
  ^-  (list message-preview)
  =/  rolo  (get-rolo bowl)
  =/  wrapped-briefs  (~(run by briefs) |=([v=brief:briefs:c] [brief=v bowl=bowl rolo]))
  =/  prev-map        (~(rut by wrapped-briefs) preview-from-wrapped-brief)  
  %:  murn
    ~(val by prev-map)
    |=([u=(unit message-preview)] u)
  ==
++  preview-from-wrapped-brief
  |=  [=whom:c [=brief:briefs:c =bowl:gall rolo=rolodex]]
  ^-  (unit message-preview)
  ?-  -.whom
      %flag
    ~
      %club
    =/  =crew:club:c  (get-crew `@uvh`p.whom bowl)
    =/  meta
      (turn ~(tap in team.crew) |=(=ship (form-contact-mtd rolo ship)))
    =/  our-in-team    (~(has in team.crew) our.bowl)
    =/  =writs:c  .^(writs:c %gx /(scot %p our.bowl)/chat/(scot %da now.bowl)/club/(scot %uv `@uvh`p.whom)/writs/newest/1/noun)
    =/  recent-msg      (snag 0 (messages-from-writs writs))
    =/  prev-contents   (weld [[%mention author.recent-msg] ~] contents.recent-msg)
    :-  ~
    :*  path=(spat /(scot %p our.bowl)/(scot %uv p.whom))
    ::  old path format: (spat /(scot %p entity)/(cord name))
        to=(~(uni in team.crew) hive.crew)
        type=?:(our-in-team %group %group-pending)
        source=%talk
        last-time-sent=last.brief
        last-message=prev-contents
        metadata=meta
        invite-id=?:(our-in-team ~ `p.whom)
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
::
++  get-newest-msg-as-list-content
  |=  [=ship =bowl:gall]
  ::~&  %get-newest-msg-as-list-content
  ^-  (list content)
  =/  newest-msg-list  .^(writs:c %gx /(scot %p our.bowl)/chat/(scot %da now.bowl)/dm/(scot %p ship)/writs/newest/1/noun)
  =/  newest-msg  (snag 0 (tap:on:writs:c newest-msg-list))
  =/  memo  ^-(memo:c +.+.newest-msg)
  (transform-content content.memo author.memo)
::
++  get-rolo
  |=  =bowl:gall
  ^-  rolodex
  .^(rolodex %gx /(scot %p our.bowl)/contact-store/(scot %da now.bowl)/all/noun)
::
++  get-crew
  |=  [id=@uvH =bowl:gall]
  ^-  crew:club:c
  .^(crew:club:c %gx /(scot %p our.bowl)/chat/(scot %da now.bowl)/club/(scot %uv id)/crew/noun)
::
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
::
++  create-club-action-from-courier-post
    |=  [id=@uvH =post]
    :: ~&  id
    ^-  action:club:c
    =/  inlines
      ^-  (list inline:c)
      (turn contents.post into-chat-inline-type)
    =/  blocks
      ^-  (list block:c)
      (murn contents.post into-chat-block-type)
    :: ~&  >>  ['blocks' blocks]
    =/  delta-for-chat   [%add (memo:c ~ author.post time-sent.post [%story [blocks (snoc inlines [%break ~])]])]
    =/  writ-diff  [[author.post time-sent.post] delta-for-chat]
    [id `diff:club:c`[0 `delta:club:c`[%writ writ-diff]]]
::
++  create-chat-remark-action-from-ship
    |=  [=ship]
    ^-  remark-action:c
    [^-(whom:c [%ship ship]) ^-(remark-diff:c [%read ~])]
::
++  create-chat-remark-action-from-resource
    |=  [=resource]
    ^-  remark-action:c
    =/  club-id-unit  `(unit @uvH)`((slat %uv) `@t`name.resource)
    ?~  club-id-unit  !!
    [^-(whom:c [%club +:club-id-unit]) ^-(remark-diff:c [%read ~])]
::
++  chat-from-crew
  |=  [id=@uvH =crew:club:c =bowl:gall]
  ^-  chat
  =/  new-writs  .^(writs:c %gx /(scot %p our.bowl)/chat/(scot %da now.bowl)/club/(scot %uv id)/writs/newest/1/noun)
  =/  group-ships   (~(uni in team.crew) hive.crew)
  =/  rolo          (get-rolo bowl)
  :*
    path=(spat /(scot %p our.bowl)/(scot %uv id))
    to=group-ships
    type=?:((~(has in team.crew) our.bowl) %group %group-pending)
    source=%talk
    messages=(messages-from-writs new-writs)
    metadata=(turn ~(tap in group-ships) |=([s=ship] (form-contact-mtd rolo s)))
  ==
::
++  chat-from-newest-writ
  |=  [=ship =bowl:gall]
  ^-  chat
  =/  new-writs  .^(writs:c %gx /(scot %p our.bowl)/chat/(scot %da now.bowl)/dm/(scot %p ship)/writs/newest/1/noun)
  :*
    path=(spat /dm-inbox/(scot %p ship))
    to=(~(put in *(set ^ship)) ship)
    type=%dm
    source=%talk
    messages=(messages-from-writs new-writs)
    metadata=~[(form-contact-mtd (get-rolo bowl) ship)]
  ==
::
++  propagate-briefs-fact
    |=  [cg=cage =bowl:gall state=state-1]
    ^-  (list card:agent:gall)
    ?+  p.cg   !!
      %chat-brief-update
        =/  the-fact      !<([whom:c brief:briefs:c] q.cg)
        =/  dm-received-cards
        ?-  -.-.the-fact
          %club
            =/  crew    (get-crew +.-.the-fact bowl)
            =/  group-ships   (~(uni in team.crew) hive.crew)
            =/  new-dm  (chat-from-crew +.-.the-fact crew bowl)
            (send-updates new-dm bowl state)
          %flag  ~
          %ship
            =/  new-dm  (chat-from-newest-writ p.-.the-fact bowl)
            =/  msg     (snag 0 messages.new-dm)
            ?:  =(author.msg our.bowl)  ~
            (send-updates new-dm bowl state)
            :: =/  new-dm  (chat-from-newest-writ p.-.the-fact bowl)
            :: (send-updates new-dm bowl state)
        ==
        ?~  dm-received-cards  ~
        =/  the-preview   (preview-from-wrapped-brief -.the-fact [+.the-fact bowl (get-rolo bowl)])
        :: ~&  >  'the-preview in propagate-briefs-fact'
        :: ~&  >  the-preview
        ?~  the-preview  dm-received-cards
        ::  don't send the dm-received-cards, which may include a push
        ::  notification, if the unread-count is zero, because
        ::  that means they create a bunch of uneccessary pushes
        ?:  =(unread-count:(need the-preview) 0)
        [%give %fact [/updates ~] graph-dm-reaction+!>([%previews [+.the-preview ~]])]~
        :-
        [%give %fact [/updates ~] graph-dm-reaction+!>([%previews [+.the-preview ~]])]
        dm-received-cards
    ==
::
++  send-updates :: same underlying logic as old one, but just making the cards
  |=  [new-dm=chat =bowl:gall state=state-1]
  ^-  (list card:agent:gall)
  ?:
  ?|  =(%.n push-enabled.state)                :: we've disabled push
      (is-our-message:gs:lib our.bowl new-dm)  :: its our message (outgoing)
      =((lent ~(tap by devices.state)) 0)      :: there are no devices
  ==
  :: in those simple conditions, just return the %dm-received card as
  :: list of cards
  ~&  "just giving dm-received fact"
  [%give %fact [/updates ~] graph-dm-reaction+!>([%dm-received new-dm])]~
  :: ELSE
  :: return the %dm-received card and the push-notification card
  =/  notify   (generate-push-notification:notif-lib our.bowl app-id.state new-dm)
  ::  send http request
  ::
  =/  =header-list:http    ['Content-Type' 'application/json']~
  =|  =request:http
  :: TODO include the unread count in the push notif (perhaps global?)
  =:  method.request       %'POST'
      url.request          'https://onesignal.com/api/v1/notifications'
      header-list.request  header-list
      body.request
        :-  ~
        %-  as-octt:mimes:html
        %-  en-json:html
        (request:enjs:notif-lib notify devices.state)
  ==
  :~
    [%give %fact [/updates ~] graph-dm-reaction+!>([%dm-received new-dm])]
    [%pass /push-notification/(scot %da now.bowl) %arvo %i %request request *outbound-config:iris]
    ::  Send to onesignal
  ==
::
++  form-pending
  |=  [=ship now=@da rolo=rolodex]
  ^-  message-preview
  =/  path              (spat /dm-inbox/(scot %p ship))
  [path (silt ~[ship]) %pending %talk now [~] ~[(form-contact-mtd rolo ship)] ~ 0]
::
++  club-sub-card
  |=  [=whom:c our=ship]
  ^-  card:agent:gall
  ?-  -.whom
    %ship   !!
    %flag   !!
    %club
    [%pass /g2/club/(scot %uv p.whom)/ui %agent [our %chat] %watch /club/(scot %uv p.whom)/ui/writs]
  ==
::
++  club-leave-card
  |=  [=whom:c our=ship]
  ^-  card:agent:gall
  ?-  -.whom
    %ship   !!
    %flag   !!
    %club
    [%pass /g2/club/(scot %uv p.whom)/ui %agent [our %chat] %leave ~]
  ==
::
++  set-groups-target
    |=  [new-target=targetable-groups =bowl:gall]
    ^-  (list card:agent:gall)
    ?-  new-target
      %1  :: Clean up base groups 2 subs
        =/  hardcoded
          :~
            [%pass /g2/briefs %agent [our.bowl %chat] %leave ~]
            [%pass /g2/club/new %agent [our.bowl %chat] %leave ~]
            [%pass /g2/dm/invited %agent [our.bowl %chat] %leave ~]
            ::
            [%pass /graph-store %agent [our.bowl %graph-store] %watch /updates]
            [%pass /dm-hook %agent [our.bowl %dm-hook] %watch /updates]
          ==
        =/  =briefs:c   .^(briefs:c %gx /(scot %p our.bowl)/chat/(scot %da now.bowl)/briefs/noun)
        =/  whoms       ~(tap in ~(key by briefs))
        =/  clubs       (skim whoms |=(w=whom:c =(-.w %club)))
        =/  dynamic     `(list card:agent:gall)`(turn clubs |=(w=whom:c (club-leave-card w our.bowl)))
        (weld `(list card:agent:gall)`hardcoded dynamic)
      ::
      %2
      =/  hardcoded  :~  :: define list of cards to update subscriptions for the paths we always know we need to do
        :: don't care about graph-store&dm-hook anymore
        :: since we're on groups-two
        [%pass /graph-store %agent [our.bowl %graph-store] %leave ~]
        [%pass /dm-hook %agent [our.bowl %dm-hook] %leave ~]
        :: and sub to new junk
        [%pass /g2/briefs %agent [our.bowl %chat] %watch /briefs]
        [%pass /g2/club/new %agent [our.bowl %chat] %watch /club/new]
        [%pass /g2/dm/invited %agent [our.bowl %chat] %watch /dm/invited]
      ==
      =/  =briefs:c   .^(briefs:c %gx /(scot %p our.bowl)/chat/(scot %da now.bowl)/briefs/noun)
      =/  whoms       ~(tap in ~(key by briefs))
      =/  clubs       (skim whoms |=(w=whom:c =(-.w %club)))
      =/  dynamic     `(list card:agent:gall)`(turn clubs |=(w=whom:c (club-sub-card w our.bowl)))
      (weld `(list card:agent:gall)`hardcoded dynamic)
    ==
--
