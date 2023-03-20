/-  sur=composer
|%
++  dejs
  =,  dejs:format
  |%
  ++  action
    |=  jon=json
    ^-  action:sur
    =<  (decode jon)
    |%
    ++  decode
      %-  of
      :~  [%add-bookmark (ot ~[url+so permissions+permissions])]
          [%remove-bookmark (ot ~[url+so])]
          [%set-settings (ot ~[ul])]
      ==
    ++  permissions
      %-  ot
      :~  [%ship (su ;~(pfix sig fed:ag))]
          [%space so]
      ==
    --
  --
::
++  enjs
  =,  enjs:format
  |%
  ++  view
    |=  =view:sur
    ^-  json
    ?-  -.view
        %bookmarks
      %-  pairs
      :_  ~
      ^-  [cord json]
      [%bookmarks (bookmarks:encode bookmarks.view)]
    ==
  --
::
++  encode
  =,  enjs:format
  |%
  ++  bookmarks
    |=  =compositions:sur
    ^-  json
    %-  pairs
    %+  turn  ~(tap by bookmarks)
    |=  [=url:sur =permissions:sur]
    ^-  [cord json]
    :-  ''
    %-  pairs
    :~  ['space' s+(spat /(scot %p ship.space.composer)/(scot %tas space.space.composer))]
    ==
  --
--

