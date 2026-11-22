import serial,time,json,os
from pathlib import Path
p=Path(os.environ['STCS_ESP_LAB_DIR'])/'serial.jsonl'
s=serial.Serial();s.port=os.environ['STCS_ESP_PORT'];s.baudrate=115200;s.timeout=.1;s.dtr=True;s.rts=False;s.open()
try:
 with p.open('a',encoding='utf-8') as f:
  while True:
   line=s.readline().decode(errors='replace').strip()
   if line.startswith(('STCS_','DEVICE_EVENT|','AUDIO_INFO|','AUDIO_EOF|')) and not any(k in line.lower() for k in ['password','secret','api_key']):
    f.write(json.dumps({'time':int(time.time()*1000),'line':line})+'\n');f.flush()
except KeyboardInterrupt:pass
finally:s.close()
