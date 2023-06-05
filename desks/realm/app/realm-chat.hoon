::  app/realm-chat.hoon
/-  *realm-chat, db-sur=chat-db, ndb=notif-db, fr=friends, spc=spaces-store
/+  dbug, lib=realm-chat, db-lib=chat-db
=|  state-0
=*  state  -
:: ^-  agent:gall
=<
  %-  agent:dbug
  |_  =bowl:gall
  +*  this  .
      core   ~(. +> [bowl ~])
  ::
  ++  on-init
    ^-  (quip card _this)
    =/  default-state=state-0
      :*  %0
          '82328a88-f49e-4f05-bc2b-06f61d5a733e'  :: app-id
          (sham our.bowl)                         :: uuid
          *(map @t @t)
          %.y            :: push-enabled
          ~              :: set of muted chats
          ~              :: set of pinned chats
          %.y            :: msg-preview-notif
      ==

    =/  subs   [%pass /db %agent [our.bowl %chat-db] %watch /db]~
    ::  now check if we need to create a notes-to-self chat
    =/  selfpaths=(list path-row:db-sur)  (skim (scry-paths:lib bowl) |=(p=path-row:db-sur =(type.p %self)))
    =/  createcards
      ?.  =(0 (lent selfpaths))  ~
      -:(create-chat:lib [(notes-to-self bowl) %self ~ %host *@dr] state bowl)

    [(weld subs createcards) this(state default-state)]
  ++  on-save   !>(state)
  ++  on-load
    |=  old-state=vase
    ^-  (quip card _this)
    :: do a quick check to make sure we are subbed to /db in %chat-db
    =/  cards=(list card)
      ?:  =(wex.bowl ~)  
        [%pass /db %agent [our.bowl %chat-db] %watch /db]~
      ~
    ::  now check if we need to create a notes-to-self chat
    =/  selfpaths=(list path-row:db-sur)  (skim (scry-paths:lib bowl) |=(p=path-row:db-sur =(type.p %self)))
    =.  cards
      ?.  =(0 (lent selfpaths))  cards
      (weld cards -:(create-chat:lib [(notes-to-self bowl) %self ~ %host *@dr] state bowl))
      
    =/  old  !<(versioned-state old-state)
    =.  app-id.old  '82328a88-f49e-4f05-bc2b-06f61d5a733e'  :: app-id
    ?-  -.old
      %0  [cards this(state old)]
    ==
  ::
  ++  on-poke
    |=  [=mark =vase]
    ^-  (quip card _this)
    ?>  ?=(%chat-action mark)
    =/  act  !<(action vase)
    =^  cards  state
    ?-  -.act  :: each handler function here should return [(list card) state]
      :: meta-chat management pokes
      %create-chat
        (create-chat:lib +.act state bowl)
      %edit-chat
        (edit-chat:lib +.act state bowl)
      %pin-message
        (pin-message:lib +.act state bowl)
      %clear-pinned-messages
        (clear-pinned-messages:lib +.act state bowl)
      %add-ship-to-chat
        (add-ship-to-chat:lib +.act state bowl)
      %remove-ship-from-chat
        (remove-ship-from-chat:lib +.act state bowl)
      :: message management pokes
      %send-message
        (send-message:lib +.act state bowl)
      %edit-message
        (edit-message:lib +.act state bowl)
      %delete-message
        (delete-message:lib +.act state bowl)
      %delete-backlog
        (delete-backlog:lib +.act state bowl)
      :: notification preferences pokes
      %disable-push
        (disable-push:lib state bowl)
      %enable-push
        (enable-push:lib state bowl)
      %remove-device
        (remove-device:lib +.act state bowl)
      %set-device
        (set-device:lib +.act state bowl)
      %mute-chat
        (mute-chat:lib +.act state bowl)
      %pin-chat
        (pin-chat:lib +.act state bowl)
      %toggle-msg-preview-notif
        (toggle-msg-preview-notif:lib +.act state bowl)
    ==
    [cards this]
  ::  realm-chat supports no subscriptions
  ::  realm-chat does not care
  ::  (users/frontends shoulc sub to %chat-db agent)
  ++  on-watch
    |=  =path
    ^-  (quip card _this)
    !!
  :: we support devices peek for push notifications
  :: and pins peek for list of pinned chats
  ++  on-peek
    |=  =path
    ^-  (unit (unit cage))
    ?+    path  !!
    ::
      [%x %devices ~]
        ?>  =(our.bowl src.bowl)
        ``notify-view+!>(devices.state)
    ::
      [%x %pins ~]
        ?>  =(our.bowl src.bowl)
        ``chat-pins+!>(pins.state)
    ::
      [%x %mutes ~]
        ?>  =(our.bowl src.bowl)
        ``chat-mutes+!>(mutes.state)
    ::
      [%x %settings ~]
        ?>  =(our.bowl src.bowl)
        ``chat-settings+!>([push-enabled.state msg-preview-notif.state])
    ==
  ::
  ++  on-agent
    |=  [=wire =sign:agent:gall]
    ^-  (quip card _this)
    ?+    wire  !!
      [%dbpoke ~]
      :: [%dbpoke *]
        ?+    -.sign  `this
          %poke-ack
            ?~  p.sign  `this
            ~&  >>>  "%realm-chat: {<(spat wire)>} dbpoke failed"
            :: ~&  >>>  p.sign
            `this
            :: ?~  +.wire
            ::   ~&  >>>  "%realm-chat: {<(spat wire)>} dbpoke failed in an unhandled way"
            ::   ~&  >>>  p.sign
            ::   `this
            :: ~&  >>>  "kicking {<src.bowl>} from {(spud +.wire)} because /dbpoke got a poke-nack"
            :: =/  fakebowl   bowl
            :: =.  src.fakebowl  our.bowl
            :: =/  cs  (remove-ship-from-chat:lib [+.wire src.bowl] state fakebowl)
            :: [-.cs this(state +.cs)]
        ==
      [%selfpoke ~]
        ?+    -.sign  `this
          %poke-ack
            ?~  p.sign  `this
            ~&  >>>  "%realm-chat: {<(spat wire)>} selfpoke failed"
            `this
        ==
      [%db ~]
        ?+    -.sign  !!
          %watch-ack
            ?~  p.sign  `this
            ~&  >>>  "{<dap.bowl>}: /db subscription failed"
            `this
          %kick
            ~&  >  "{<dap.bowl>}: /db kicked us, resubscribing..."
            :_  this
            :~
              [%pass /db %agent [our.bowl %chat-db] %watch /db]
            ==
          %fact
            ?+    p.cage.sign  `this
              %chat-db-dump
                `this
              %chat-db-change
                =/  thechange=db-change:db-sur  !<(db-change:db-sur q.cage.sign)

                =/  new-msg-parts=(list msg-part:db-sur)
                  %+  turn
                    %+  skim
                      thechange 
                    |=(ch=db-change-type:db-sur &(=(-.ch %add-row) =(%messages -.+.ch)))
                  |=  ch=db-change-type:db-sur
                  ?+  -.ch    !!
                    %add-row
                    ?+  -.db-row.ch   !!
                      %messages       msg-part.db-row.ch
                    ==
                  ==
                =/  new-msg-ids=(list msg-id:db-sur)
                  ~(tap in (silt (turn new-msg-parts |=(m=msg-part:db-sur msg-id.m))))
                =/  new-msg-notif-cards=(list card)
                  %-  zing
                  %+  turn
                    new-msg-ids
                  |=  id=msg-id:db-sur
                  ^-  (list card)
                  =/  parts     (skim new-msg-parts |=(p=msg-part:db-sur =(msg-id.p id)))
                  =/  first-msg-part  (snag 0 parts)
                  ?:  =(-.content.first-msg-part %status) :: don't send notifs on %status msgs
                    ~
                  =/  thepath   path.first-msg-part
                  ?:  =(sender.id our.bowl) :: if it's our message, don't do anything
                    ~
                  ::  if it's a %react AND it's not reacting to our
                  ::  message, don't do anything
                  =/  not-replying-to-us=?
                    ?~  reply-to.first-msg-part  %.y
                      ?!(=(our.bowl +:+:(need reply-to.first-msg-part)))
                  ?:  &(=(-.content.first-msg-part %react) not-replying-to-us)  ~
                  ?:  (~(has in mutes.state) thepath)               :: if it's a muted path, send a pre-dismissed notif to notif-db
                    =/  notif-db-card  (notif-new-msg:core parts our.bowl %.y bowl)
                    [notif-db-card ~]
                  =/  notif-db-card  (notif-new-msg:core parts our.bowl %.n bowl)
                  ?:  :: if we should do a push notification also,
                  ?&  push-enabled.state                  :: push is enabled
                      (gth (lent ~(tap by devices.state)) 0) :: there is at least one device
                  ==
                    =/  prow            (scry-path-row:lib thepath bowl)
                    =/  push-title      (notif-from-nickname-or-patp sender.id bowl)
                    =/  push-subtitle   (group-name-or-blank prow)
                    =/  push-contents   (notif-msg parts bowl)
                    =/  unread-count    +(.^(@ud %gx /(scot %p our.bowl)/notif-db/(scot %da now.bowl)/db/unread-count/(scot %tas %realm-chat)/noun))
                    =/  avatar=(unit @t)
                      ?:  =(%dm type.prow)      (scry-avatar-for-patp:lib sender.id bowl)
                      ?:  =(%group type.prow)   (~(get by metadata.prow) 'image')
                      ?:  =(%space type.prow)
                        =/  uspace  (~(get by metadata.prow) 'space')
                        ?~  uspace  ~
                        =/  path-first=path   /(scot %p our.bowl)/spaces/(scot %da now.bowl)
                        =/  path-second=path  (stab u.uspace)
                        =/  path-final=path   (weld (weld path-first path-second) /noun)
                        =/  space-scry    .^(view:spc %gx path-final)
                        ?>  ?=(%space -.space-scry)
                        ?:  =('' picture.space.space-scry)
                          (some wallpaper.theme.space.space-scry)
                        (some picture.space.space-scry)
                      ~  :: default to null if we don't know what type of chat this is
                    =/  push-card
                      %:  push-notification-card:lib
                          bowl
                          state
                          prow
                          push-title
                          push-subtitle
                          push-contents
                          unread-count
                          avatar
                      ==
                    [push-card notif-db-card ~]
                  :: otherwise, just send to notif-db
                  [notif-db-card ~]

                =/  cards=(list card)
                  %-  zing
                  %+  turn
                    thechange 
                  |=  ch=db-change-type:db-sur
                  ^-  (list card)
                  ?+  -.ch  ~
                    %add-row
                    ?+  -.db-row.ch  ~
                      %paths
                        =/  pathrow  path-row.db-row.ch
                        =/  pathpeers  (scry-peers:lib path.pathrow bowl)
                        =/  host  (snag 0 (skim pathpeers |=(p=peer-row:db-sur =(role.p %host))))
                        ?:  =(patp.host our.bowl) :: if it's our own creation, don't do anything
                          ~
                        =/  send-status-message
                          !>([%send-message path.pathrow ~[[[%status (crip "{(scow %p our.bowl)} joined the chat")] ~ ~]] *@dr])
                        [%pass /selfpoke %agent [our.bowl %realm-chat] %poke %chat-action send-status-message]~
                    ==

                    %upd-paths-row
                      =/  pathpeers  (scry-peers:lib path.path-row.ch bowl)
                      =/  host  (snag 0 (skim pathpeers |=(p=peer-row:db =(role.p %host))))
                      ?:  ?&  =(patp.host our.bowl) :: only host will send the status update
                              ?!(=(max-expires-at-duration.path-row.ch max-expires-at-duration.old.ch)) :: only do the status if the max duration changed
                          ==
                        =/  send-status-message
                          ?:  =(max-expires-at-duration.path-row.ch *@dr)
                            !>([%send-message path.path-row.ch ~[[[%status (crip "Messages now last forever")] ~ ~]] *@dr])
                          !>([%send-message path.path-row.ch ~[[[%status (crip "You set disappearing messages to {(scow %dr max-expires-at-duration.path-row.ch)}")] ~ ~]] *@dr])
                        [%pass /selfpoke %agent [our.bowl %realm-chat] %poke %chat-action send-status-message]~
                      ~

                    %del-paths-row
                      =/  notif-ids=(list @ud)
                        %+  turn
                          (scry-notifs-for-path path.ch bowl)
                        |=(n=notif-row:ndb id.n)
                      %+  turn  notif-ids
                      |=  id=@ud
                      ^-  card
                      [%pass /dbpoke %agent [our.bowl %notif-db] %poke %notif-db-poke !>([%delete id])]
                  ==
                [(weld cards new-msg-notif-cards) this]
            ==
        ==
    ==
  ::
  ++  on-leave
    |=  path
      `this
  :: we don't care about arvo
  ++  on-arvo
    |=  [=wire =sign-arvo]
    ^-  (quip card _this)
    `this
  ::
  ++  on-fail
    |=  [=term =tang]
    %-  (slog leaf+"error in {<dap.bowl>}" >term< tang)
    `this
  --
|_  [=bowl:gall cards=(list card)]
::
++  this  .
++  core  .
++  is-new-message
  |=  ch=*
  ^-  ?
  ?+  -.ch  %.n
    %add-row  =(-.+.ch %messages)
  ==
::
++  scry-notifs-for-path
  |=  [=path =bowl:gall]
  ^-  (list notif-row:ndb)
  =/  scry-path  (weld /(scot %p our.bowl)/notif-db/(scot %da now.bowl)/db/path/realm-chat path)
  .^  (list notif-row:ndb)
      %gx
      (weld scry-path /noun)
  ==
::
++  notif-new-msg
  |=  [=message:db-sur =ship dismissed=? =bowl:gall]
  ^-  card
  =/  msg-part  (snag 0 message)
  =/  title     (notif-msg message bowl)
  =/  content   (notif-from-nickname-or-patp sender.msg-id.msg-part bowl)
  =/  link      (msg-id-to-cord:encode:db-lib msg-id.msg-part)
  ~&  >  link
  [
    %pass
    /dbpoke
    %agent
    [ship %notif-db]
    %poke
    %notif-db-poke
    !>([%create %realm-chat path.msg-part %message title content '' ~ link ~ dismissed])
  ]
::  returns either 'New Message' or a preview of the actual message
::  depending on `msg-preview-notif.state` flag
++  notif-msg
  |=  [=message:db-sur =bowl:gall]
  ^-  @t
  ?.  msg-preview-notif.state  'New Message'
  =/  str=tape
    ^-  tape
    %+  join
      ' '
    %+  turn
      message
    |=  part=msg-part:db-sur
    ^-  @t
    :: show the content text from the types where it makes sense to do
    :: so. For the others, just show the name of the type (like "image")
    ?+  -.content.part      -.content.part
      %plain                p.content.part
      %bold                 p.content.part
      %italics              p.content.part
      %strike               p.content.part
      %bold-italics         p.content.part
      %bold-strike          p.content.part
      %italics-strike       p.content.part
      %bold-italics-strike  p.content.part
      %blockquote           p.content.part
      %inline-code          p.content.part
      %code                 p.content.part
      %status               p.content.part
    ==
  (crip `tape`(swag [0 140] str)) :: only show the first 140 characters of the message in the preview
++  group-name-or-blank
  |=  [=path-row:db-sur]
  ^-  @t
  =/  title       (~(get by metadata.path-row) 'title')
  ?:  =(type.path-row %dm)   '' :: always blank for DMs
  ?~  title     'Group Chat'    :: if it's a group chat without a title, just say "group chat"
  (need title)                  :: otherwise, return the title of the group
::
++  notif-from-nickname-or-patp
  |=  [patp=ship =bowl:gall]
  ^-  @t
  =/  cv=view:fr
    .^  view:fr
        %gx
        /(scot %p our.bowl)/friends/(scot %da now.bowl)/contact-hoon/(scot %p patp)/noun
    ==
  =/  nickname=@t
    ?+  -.cv  (scot %p patp) :: if the scry came back wonky, just fall back to patp
      %contact-info
        nickname.contact-info.cv
    ==
  ?:  =('' nickname)
    (scot %p patp)
  nickname
++  notes-to-self  |=(=bowl:gall (malt ~[['title' 'Notes to Self'] ['reactions' 'true'] ['creator' (scot %p our.bowl)] ['description' '']]))
--
