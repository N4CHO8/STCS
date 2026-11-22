from pathlib import Path
import re,shutil,datetime,ipaddress,os,sys
from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import hashes,serialization
from cryptography.hazmat.primitives.asymmetric import rsa

folder=Path(os.environ['STCS_ESP_LAB_DIR']).resolve();folder.mkdir(parents=True,exist_ok=True)
ip=sys.argv[1];assert ipaddress.ip_address(ip).is_private and not ipaddress.ip_address(ip).is_loopback
root=Path.cwd().resolve();assert (root/'frontend/scripts/run-media-lab.mjs').is_file()
front=root/'frontend'
def certs(prefix):
 key=rsa.generate_private_key(public_exponent=65537,key_size=2048)
 name=x509.Name([x509.NameAttribute(NameOID.COMMON_NAME,'STCS isolated '+prefix)])
 begin=datetime.datetime(2024,1,1);end=datetime.datetime(2035,1,1)
 ca=x509.CertificateBuilder().subject_name(name).issuer_name(name).public_key(key.public_key()).serial_number(x509.random_serial_number()).not_valid_before(begin).not_valid_after(end).add_extension(x509.BasicConstraints(ca=True,path_length=None),critical=True).sign(key,hashes.SHA256())
 sk=rsa.generate_private_key(public_exponent=65537,key_size=2048)
 server=x509.CertificateBuilder().subject_name(x509.Name([x509.NameAttribute(NameOID.COMMON_NAME,ip)])).issuer_name(name).public_key(sk.public_key()).serial_number(x509.random_serial_number()).not_valid_before(begin).not_valid_after(end).add_extension(x509.SubjectAlternativeName([x509.IPAddress(ipaddress.ip_address(ip))]),critical=False).add_extension(x509.ExtendedKeyUsage([x509.oid.ExtendedKeyUsageOID.SERVER_AUTH]),critical=False).sign(key,hashes.SHA256())
 (folder/(prefix+'-ca.pem')).write_bytes(ca.public_bytes(serialization.Encoding.PEM))
 (folder/(prefix+'-cert.pem')).write_bytes(server.public_bytes(serialization.Encoding.PEM))
 (folder/(prefix+'-key.pem')).write_bytes(sk.private_bytes(serialization.Encoding.PEM,serialization.PrivateFormat.PKCS8,serialization.NoEncryption()))
certs('trusted');certs('untrusted')
s=(front/'scripts/run-media-lab.mjs').read_text(encoding='utf-8')
s=s.replace('from "pg"','from "'+(front/'node_modules/pg/lib/index.js').as_uri()+'"').replace('from "bcryptjs"','from "'+(front/'node_modules/bcryptjs/index.js').as_uri()+'"')
s=re.sub(r'from "(\.\.?/[^\"]+)"',lambda m:'from "'+(front/'scripts'/m[1]).resolve().as_uri()+'"',s)
s=re.sub(r'const folder = join\([\s\S]*?"STCS-private",\s*\);', 'const folder = process.env.STCS_ESP_LAB_DIR;', s, count=1)
s=s.replace('fileURLToPath(new URL("../../", import.meta.url))','"'+root.as_posix()+'/"')
s=s.replace('"hito3-local.json"','"lab.json"').replace('STCS-LAB-H3-001','STCS-PC18-001')
s=s.replace('55432/postgres','55432/stcs_release_tests')
s=s.replace('"http://${host}:3100"','"https://${host}:3444"').replace('STCS_ALLOW_INSECURE_HTTP 1','STCS_ALLOW_INSECURE_HTTP 0')
s=s.replace('"hito3-network.h"','"network.h"').replace('join(folder, "hito3-media")','join(folder, "media")')
(folder/'lab.mjs').write_text(s,encoding='utf-8')
sketch=folder/'sketch/STCS_UI_Arduino';sketch.mkdir(parents=True,exist_ok=True)
for p in (root/'firmware/STCS_UI_Arduino').iterdir():
 if p.is_file() and p.name not in ['STCS_NetworkSecrets.h','STCS_AudioAssets.c']:shutil.copy2(p,sketch/p.name)
trust=(sketch/'STCS_TrustRoots.h').read_text(encoding='utf-8')
trust=trust.replace(')STCS";',(folder/'trusted-ca.pem').read_text()+')STCS";')
(sketch/'STCS_TrustRoots.h').write_text(trust,encoding='utf-8')
net=(sketch/'STCS_Network.cpp').read_text(encoding='utf-8').replace('v0.8.6-wifi-status','v0.8.6-pc18-lab')
(sketch/'STCS_Network.cpp').write_text(net,encoding='utf-8')
ui=(sketch/'STCS_UI.cpp').read_text(encoding='utf-8')
anchor='  printf("STCS_BOARD|pictograms='
pos=ui.index(anchor)
ui=ui[:pos]+'  if (config->count) printf("STCS_PROBE|label=%s|audio=%d|image=%d|ms=%u\\r\\n", config->pictograms[0].label, config->pictograms[0].audio_ready, config->pictograms[0].image_data != nullptr, (unsigned)millis());\n'+ui[pos:]
(sketch/'STCS_UI.cpp').write_text(ui,encoding='utf-8')
print('Certificados de laboratorio, copia del runner y sketch aislado preparados; fuente original intacta.')
