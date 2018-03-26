ip="192.168.1.$1"
ssh root@$ip 'mount -o remount,rw /'
scp ~/DataEncryption/nipunpsa/advancedOptions.js root@$ip:/opt/kerio/operator/www/admin/advancedOptions.js
scp ~/DataEncryption/nipunpsa/Encryption.inc root@$ip:/opt/kerio/operator/www/lib/managers/
scp ~/DataEncryption/nipunpsa/dataEncryption22Mar_vivek.sh root@$ip:/opt/kerio/operator/bin/dataEncryption.sh
scp ~/DataEncryption/nipunpsa/start_stop_service.sh  root@$ip:/opt/kerio/operator/bin/
ssh root@$ip '/opt/kerio/operator/bin/start_stop_service.sh stop'
ssh root@$ip '/opt/kerio/operator/bin/start_stop_service.sh start'
