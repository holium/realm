:+  'Single (Both)'
  :~  ['Start' %dx]
      ['End' %dx]
  ==
'''
|=  args=(map @t arg)
=/  s=dext  +:;;($>(%dx arg) (~(got by args) 'Start'))
=/  e=dext  +:;;($>(%dx arg) (~(got by args) 'End'))
^-  $-(@ud (each [dext dext] rule-exception))
|=(@ud [%& s e])
'''
