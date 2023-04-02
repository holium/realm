::  app/realm-chat.hoon
/-  *realm-chat, db-sur=chat-db, notify
/+  dbug, lib=realm-chat
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
          '82328a88-f49e-4f05-bc2b-06f61d5a733e'  :: app-id:notify
          (sham our.bowl)                         :: uuid:notify
          *devices:notify
          %.y            :: push-enabled
          ~              :: set of muted chats
          ~              :: set of pinned chats
          %.n            :: msg-preview-notif
      ==
    :_  this(state default-state)
    :~
      [%pass /db %agent [our.bowl %chat-db] %watch /db]
    ==
  ++  on-save   !>(state)
  ++  on-load
    |=  old-state=vase
    ^-  (quip card _this)
    :: do a quick check to make sure we are subbed to /db in %chat-db
    =/  cards  ?:  =(wex.bowl ~)  
      [%pass /db %agent [our.bowl %chat-db] %watch /db]~
    ~
    =/  old  !<(versioned-state old-state)
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
        (disable-push:lib state)
      %enable-push
        (enable-push:lib state)
      %remove-device
        (remove-device:lib +.act state)
      %set-device
        (set-device:lib +.act state)
      %mute-chat
        (mute-chat:lib +.act state)
      %pin-chat
        (pin-chat:lib +.act state)
      %toggle-msg-preview-notif
        (toggle-msg-preview-notif:lib +.act state)
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
        ``notify-view+!>([%devices devices.state])
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
        ?+    -.sign  `this
          %poke-ack
            ?~  p.sign  `this
            ~&  >>>  "%realm-chat: {<(spat wire)>} dbpoke failed"
            ~&  >>>  p.sign
            `this
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
                  =/  thepath   path:(snag 0 parts)
                  ?:  =(sender.id our.bowl) :: if it's our message, don't do anything
                    ~
                  ?:  (~(has in mutes.state) thepath)               :: if it's a muted path, send a pre-dismissed notif to notif-db
                    =/  notif-db-card  (notif-new-msg:core parts our.bowl %.y)
                    [notif-db-card ~]
                  =/  notif-db-card  (notif-new-msg:core parts our.bowl %.n)
                  ?:  :: if we should do a push notification also,
                  ?&  push-enabled.state                  :: push is enabled
                      (gth (lent ~(tap by devices.state)) 0) :: there is at least one device
                  ==
                    =/  push-card  (push-notification-card:lib bowl state thepath (notif-msg parts) (crip "from {(scow %p sender.id)}"))
                    [push-card notif-db-card ~]
                  :: otherwise, just send to notif-db
                  [notif-db-card ~]

                =/  cards=(list card)
                  %-  zing
                  %+  turn
                    %+  skim
                      thechange 
                    |=(ch=db-change-type:db-sur =(-.ch %add-row))
                  |=  ch=db-change-type:db-sur
                  ^-  (list card)
                  ?+  -.ch  ~
                    %add-row
                    ?+  -.db-row.ch  ~
                      %paths
                        =/  pathrow  path-row.db-row.ch
                        =/  pathpeers  (scry-peers:lib path.pathrow bowl)
                        =/  host  (snag 0 (skim pathpeers |=(p=peer-row:db =(role.p %host))))
                        ?:  =(patp.host our.bowl) :: if it's our own creation, don't do anything
                          ~
                        =/  send-status-message
                          !>([%send-message path.pathrow ~[[[%status (crip "{(scow %p our.bowl)} joined the chat")] ~ ~]] *@dr])
                        [%pass /selfpoke %agent [our.bowl %realm-chat] %poke %chat-action send-status-message]~
                    ==
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
    !!
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
++  notif-new-msg
  |=  [=message:db-sur =ship dismissed=?]
  ^-  card
  =/  msg-part  (snag 0 message)
  [
    %pass
    /dbpoke
    %agent
    [ship %notif-db]
    %poke
    %notif-db-poke
    !>([%create %realm-chat path.msg-part %message (notif-msg message) (crip "from {(scow %p sender.msg-id.msg-part)}") '' ~ '' ~ dismissed])
  ]
++  notif-msg
  |=  =message:db-sur
  ^-  @t
  ?.  msg-preview-notif.state
    'New Message'
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
--
