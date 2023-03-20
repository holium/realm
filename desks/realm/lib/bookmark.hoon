/-  sur=bookmark
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
          [%set-settings (ot ~[setting+ul])]
      ==
    ++  permissions
      %-  ot
      :~  [%view (as (su (perk %initiate %member %admin %owner ~)))]
          [%edit (as (su (perk %initiate %member %admin %owner ~)))]
          [%delete (as (su (perk %initiate %member %admin %owner ~)))]
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
        %settings
      %-  pairs
      :_  ~
      ^-  [cord json]
      [%settings ~]
    ==
  --
::
++  encode
  =,  enjs:format
  |%
  ++  bookmarks
    |=  =bookmarks:sur
    ^-  json
    %-  pairs
    %+  turn  ~(tap by bookmarks)
    |=  [=url:sur =permissions:sur]
    ^-  [cord json]
    :-  url
    %-  pairs
    :~  ['view' s+'']
        ['edit' s+'']
        ['delete' s+'']
    ==
  --
--

