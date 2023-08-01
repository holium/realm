:+  'Single (Left)'
  ['Start' %dx]~
'''
|=  args=(map @t arg)
=/  s=dext  +:;;($>(%dx arg) (~(got by args) 'Start'))
^-  $-(@ud (each dext rule-exception))
|=(@ud [%& s])
'''
