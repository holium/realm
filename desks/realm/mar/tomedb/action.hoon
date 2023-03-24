/-  *tomedb
|_  act=tomedb-action
++  grow
  |%
  ++  noun  act
  --
++  grab
  |%
  ++  noun  tomedb-action
  ++  json
    =,  dejs:format
    |=  jon=json
    ^-  tomedb-action
    =*  levels  (su (perk [%our %space %open %unset %yes %no ~]))
    %.  jon
    %-  of
    :~  init-tome/(ot ~[ship/so space/so app/so])
        init-kv/(ot ~[ship/so space/so app/so bucket/so perm/(ot ~[read/levels write/levels admin/levels])])
    ==
  --
++  grad  %noun
--