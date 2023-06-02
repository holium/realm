/-  spider, db
/+  *strandio
=,  strand=strand:spider
^-  thread:spider
|=  arg=vase
=/  m  (strand ,vase)
^-  form:m
=/  axn=(unit action:db)  !<((unit action:db) arg)
?~  axn  (strand-fail %no-arg ~)
?.  ?=(%create -.u.axn)  (strand-fail %no-arg ~)
;<  our=@p   bind:m  get-our
;<  now=@da  bind:m  get-time
=/  =wire  /vent/(scot %p our)/(scot %da now)
;<  ~        bind:m  (watch-our wire %db wire)
;<  ~        bind:m  (poke [our %db] db-action+!>([%create [our now] +>.u.axn]))
;<  =cage    bind:m  (take-fact wire)
(pure:m q.cage)
