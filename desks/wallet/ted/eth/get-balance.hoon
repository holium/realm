/+  strandio, ethio, ethereum
|=  args=vase
=+  !<  $:  url=@ta
            =address:ethereum
        ==
    args
=/  m  (strand:strandio ,vase)
;<  bal=@ud  bind:m  (get-balance:ethio url address)
(pure:m !>(bal))
