/-  spider, *tomedb
/+  *strandio, tomelib
=,  strand=strand:spider
::
:: Shuttle pokes to TomeDB agent on foreign ships.
:: We do this because Eyre is dumb.
::
|%
++  decode-input
  =,  dejs:format
  |=  jon=json
  %.  jon
  %-  ot
  :~  ship+so  :: needs to have no sig
      json+so
  ==
--
^-  thread:spider
|=  arg=vase
=/  m  (strand ,vase)
^-  form:m
=/  jon=json
  (need !<((unit json) arg))
=/  input  (decode-input jon)
=/  ship  `@p`(slav %p -.input)
=/  act  (tomedb-kv-action:dejs:tomelib (need (de-json:html +.input)))
::
::  This returns nothing on failure, 'success' on success.
;<  ~  bind:m  (poke [ship %tomedb] [%tomedb-kv-action !>(act)])
(pure:m !>(s+'success'))