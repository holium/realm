:+  'Single (Fullday)'
  ['Date' %da]~
'''
|=  args=(map @t arg)
=/  d=@da  +:;;($>(%da arg) (~(got by args) 'Date'))
^-  $-(@ud (each fullday rule-exception))
|=(@ud [%& (sane-fd d)])
'''
