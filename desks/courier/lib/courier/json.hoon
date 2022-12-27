/-  store=courier-chat
/-  courier-path
/+  cite-lib=groups-cite
=<  [store .]
=,  store
|%
::
++  dejs
  =,  dejs:format
  |%
  ++  action
    |=  jon=json
    ^-  action:store
    =<  (decode jon)
    |%
    ++  decode
      %-  of
      :~
          [%create-chat create-cha]
          [%leave-chat leave-cha]
          :: [%send-message send-msg]
          :: [%read-chat add-rec]
          :: [%delete-chat rem-rec]
          :: [%react suite-add]
      ==

    ++  create-cha
      %-  ot
      :~  [%type so]
          [%to (as (su ;~(pfix sig fed:ag)))]
      ==
    ::
    ++  leave-cha
      %-  ot
      [%path c-path]~
    ::
    :: ++  send-msg
    ::   %-  ot
    ::   :~  [%path c-path]
    ::       [%message so]
    ::   ==
    ::
    :: ++  c-path  (su ;~((glue fas) ;~(pfix sig fed:ag) ^sym))
    ++  c-path  `$-(json path:courier-path)`(su c-path-rule)
    ++  c-path-rule  ;~((glue fas) ;~(pfix sig fed:ag) sym)
    ::
    :: ++  courier-path
    ::   %-  ot
    ::   :~  [%ship (su ;~(pfix sig fed:ag))]
    ::       [%id so]
    ::   ==
    ::
    :: ++  install-app
    ::   %-  ot
    ::   :~  [%ship (su ;~(pfix sig fed:ag))]
    ::       [%desk so]
    ::   ==
    :: ::
    :: ++  uninstall-app
    ::   %-  ot
    ::   :~  [%desk so]
    ::   ==
    :: ::
    :: ++  add-pin
    ::   %-  ot
    ::   :~  [%path pth]
    ::       [%app-id so]
    ::       [%index (mu ni)]
    ::   ==
    :: ::
    :: ++  rem-pin
    ::   %-  ot
    ::   :~  [%path pth]
    ::       [%app-id so]
    ::   ==
    :: ::
    :: ++  reorder-pins
    ::   %-  ot
    ::   :~  [%path pth]
    ::       [%dock (ar so)]
    ::   ==
    :: ::
    :: ++  add-rec
    ::   %-  ot
    ::   :~  [%app-id so]
    ::   ==
    :: ::
    :: ++  rem-rec
    ::   %-  ot
    ::   :~  [%app-id so]
    ::   ==
    :: ::
    :: ++  suite-add
    ::   %-  ot
    ::   :~  [%path pth]
    ::       [%app-id so]
    ::       [%index ni]
    ::   ==
    :: ::
    :: ++  suite-remove
    ::   %-  ot
    ::   :~  [%path pth]
    ::       [%index ni]
    ::   ==
    :: ::
    :: ++  pth
    ::   %-  ot
    ::   :~  [%ship (su ;~(pfix sig fed:ag))]
    ::       [%space so]
    ::   ==
    :: ::
    :: ++  rebuild-stall
    ::   %-  ot
    ::   :~  [%path pth]
    ::       [%args ul]
    ::   ==
    :: ++  clear-stall
    ::   %-  ot
    ::   :~  [%path pth]
    ::       [%args ul]
    ::   ==
    --
  --
::
::  json
::
++  enjs
  =,  enjs:format
  |%
  ++  view
    |=  vi=^view
    ^-  json
    %-  pairs
    :_  ~
    ^-  [cord json]
    :-  -.vi
    ?-  -.vi  
        %inbox
      %-  pairs
      [%previews (c-previews:encode previews.vi)]~
    ==
  ::
  ++  reaction
    |=  rct=^reaction
    ^-  json
    %-  pairs
    :_  ~
    ^-  [cord json]
    :-  -.rct
    ?+  -.rct  ~
      ::
        %message-created
      %-  pairs
      :~  [%type s+type.rct]
          [%to a+(turn ~(tap in to.rct) |=(shp=@p s+(scot %p shp)))]
      ==
      ::
    ==
  ::
  --
::
++  encode
  =,  enjs:format
  |%
  ::
  ++  c-path 
    |=  =path:courier-path
    (spat /(scot %p p.path)/(scot %uv q.path))
  ::
  ++  c-previews
    |=  =previews:store
    ^-  json
    %-  pairs
    %+  turn  ~(tap by previews)
      |=  [=path:courier-path =preview:store]
      ^-  [cord json]
      [(cord (c-path path)) (c-preview preview)]
  ::
  ++  c-preview
    |=  cha=preview:store
    ^-  json
    %-  pairs
    :~  path+s+(spat /(scot %p p.path.cha)/(scot %uv q.path.cha))
        to+a+(turn ~(tap in to.cha) |=(shp=@p s+(scot %p shp)))
        type+s+(scot %tas type.cha)
        last-time-sent+(time:enjs:format last-sent.cha)
        last-message+(c-content last-message.cha)
        profiles+(c-profiles profiles.cha)
        unread-count+n+(scot %ud unread-count.cha)
    ==
  ::
  ++  c-profiles
    |=  =profiles:store
    ^-  json
    %-  pairs
    %+  turn  ~(tap in profiles)
      |=  [shp=@p =profile:store]
      ^-  [cord json]
      [(scot %p shp) (c-profile profile)]
  ::
  ++  c-profile
    |=  =profile:store
    ^-  json
    %-  pairs
    :~  ['nickname' s+nickname.profile]
        ['avatar' s+avatar.profile]
        ['color' s+color.profile]
    ==
  ::
  ++  c-content
    |=  c=content:store
    %-  pairs
    :~  block/a/(turn p.c block)
        inline/a/(turn q.c inline)
    ==
  ::
  ++  inline
    |=  i=inline:store
    ^-  json
    ?@  i  s+i
    %+  frond  -.i
    ?-  -.i
        %break
      ~
    ::
        %ship  s/(scot %p p.i)
    ::
        ?(%code %tag %inline-code)
      s+p.i
    ::
        ?(%italics %bold %strike %blockquote)
      :-  %a
      (turn p.i inline)
    ::
        %block
      %-  pairs
      :~  index+(numb p.i)
          text+s+q.i
      ==
    ::
        %link
      %-  pairs
      :~  href+s+p.i
          content+s+q.i
      ==
    ==
  ::
  ++  block
    |=  b=blocks:store
    ^-  json
    %+  frond  -.b
    ?-  -.b
        %cite  (enjs:cite-lib cite.b)
        %image
      %-  pairs
      :~  src+s+src.b
          height+(numb height.b)
          width+(numb width.b)
          alt+s+alt.b
      ==
    ==
  --
--
