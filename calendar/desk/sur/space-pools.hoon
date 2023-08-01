/-  s=spaces-store, p=pools
|%
+$  app           term
+$  space         space-path:s
+$  apps          (jug app id:p)
::
+$  update        (list [app id:p])
:: can create a pool in a space
:: always scries [app /space-pools/creator-gate]
::
+$  creator-gate  $-([space ship] ?)
:: can read a pool in a space
:: always scries [app /space-pools/reader-gate]
::
+$  reader-gate   $-([id:p ship] ?)
--
