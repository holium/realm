/+  strandio, ethio
|=  args=vase
=+  !<  $:  url=@ta
            tx-hash=@ux
        ==
    args
=/  m  (strand:strandio ,vase)
;<  bal=@ud  bind:m  (get-transaction-by-hash:ethio url tx-hash)
(pure:m !>(bal))
