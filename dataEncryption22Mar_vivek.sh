#!/bin/bash

. util.sh
modprobe loop
manageResourceForEncryption(){
    #start encryption

    pass=$2
    count=$1
    operation=$3

    stop_service
    create_container $count $pass $operation
    move_data_to_container $operation
    start_service
    touch /var/etc/kerio/operator/pdenabled
}

resize_increase(){
    block_count=$1
    pass=$2
    operation=$3

    #start increasing the volume size for calculate number of cylinder counts

    stop_service

    umount /var/personal_data/kerio/operator/

    cryptsetup luksClose luks

    dd if=/dev/zero bs=512 of=/var/etc/kerio/operator/luks.container conv=notrunc oflag=append count=$block_count
    command="dd if=/dev/zero bs=512 of=/var/etc/kerio/operator/luks.container conv=notrunc oflag=append count=$block_count"
dLog "$gtag $operation successful $command"
    
    echo -n $pass|cryptsetup luksOpen /var/etc/kerio/operator/luks.container luks -

    e2fsck -f /dev/mapper/luks

    resize2fs -f /dev/mapper/luks
    command="resize2fs /dev/mapper/luks"
dLog "$gtag $operation successful $command"

    mount /dev/mapper/luks /var/personal_data/kerio/operator/

    start_service

}

resize_decrease(){
    block_count=$1
    pass=$2
    operation=$3

    #start decreasing the volume size for calculate number of cylinder counts

    stop_service
    move_data_from_container $operation
    remove_container $operation
    create_container $block_count $pass $operation 
    move_data_to_container $operation
    start_service

}

manageResourceForDecryption(){
    #start decryption
    operation=$1

    stop_service
    move_data_from_container $operation
    remove_container $operation
    start_service
    rm -r /var/etc/kerio/operator/pdenabled
    command="rm -r /var/etc/kerio/operator/pdenabled"
dLog "$gtag $operation successful $command"
}

move_data_to_container(){
    operation=$1 
   
    cp -a /var/spool/asterisk/monitor/ /var/personal_data/kerio/operator/monitor/
dLog "$gtag $operation successfully moved resource /var/spool/asterisk/monitor/" 

    cp -a /var/spool/asterisk/voicemail/ /var/personal_data/kerio/operator/voicemail/
dLog "$gtag $operation successfully moved resource /var/spool/asterisk/voicemail/" 

    cp -a /var/operator/log /var/personal_data/kerio/operator/log
dLog "$gtag $operation successfully moved resource /var/operator/log" 

    mv /var/lib/firebird/2.0/data/kts.fdb /var/personal_data/kerio/operator/kts.fdb
dLog "$gtag $operation successfully moved resource /var/lib/firebird/2.0/data/kts.fdb" 


    rm -rf /var/spool/asterisk/monitor/
    rm -rf /var/spool/asterisk/voicemail/
    rm -rf /var/operator/log

    ln -s /var/personal_data/kerio/operator/monitor /var/spool/asterisk/monitor
dLog "$gtag $operation successfully created symbolik link for /var/spool/asterisk/monitor/" 

    ln -s /var/personal_data/kerio/operator/voicemail /var/spool/asterisk/voicemail
dLog "$gtag $operation successfully created symbolik link for /var/spool/asterisk/voicemail/" 

    ln -s /var/personal_data/kerio/operator/log /var/operator/log
dLog "$gtag $operation successfully created symbolik link for /var/operator/log" 

    ln -s /var/personal_data/kerio/operator/kts.fdb /var/lib/firebird/2.0/data/kts.fdb
dLog "$gtag $operation successfully created symbolik link for /var/lib/firebird/2.0/data/kts.fdb" 

}

create_container(){
    no_of_blocks=$1
    pass=$2
    operation=$3

       dd if=/dev/zero of=/var/etc/kerio/operator/luks.container bs=512 count=$no_of_blocks
       command="dd if=/dev/zero of=/var/etc/kerio/operator/luks.container bs=512 count=$no_of_blocks"
dLog "$gtag $operation successful $command"

       echo -n  $pass|cryptsetup -q luksFormat /var/etc/kerio/operator/luks.container -
       command="cryptsetup -q luksFormat /var/etc/kerio/operator/luks.container" 
dLog "$gtag $operation successful $command"

       echo -n $pass|cryptsetup luksOpen /var/etc/kerio/operator/luks.container luks -
       command="cryptsetup luksOpen /var/etc/kerio/operator/luks.container luks"
dLog "$gtag $operation successful $command"

       mkfs.ext4 -j /dev/mapper/luks
       command="mkfs.ext4 -j /dev/mapper/luks"
dLog "$gtag $operation successful $command"

       mkdir -p /var/personal_data/kerio/operator

       mount /dev/mapper/luks /var/personal_data/kerio/operator/
       command="mount /dev/mapper/luks /var/personal_data/kerio/operator/"
dLog "$gtag $operation successful $command"
}

remove_container(){
    operation=$1

    umount /var/personal_data/kerio/operator/
    command="umount /var/personal_data/kerio/operator/"
dLog "$gtag $operation successful $command"

    cryptsetup luksClose luks
    command="cryptsetup luksClose luks"
dLog "$gtag $operation successful $command"

    rm -r /var/personal_data/kerio/operator/
    command="rm -r /var/personal_data/kerio/operator/"
dLog "$gtag $operation successful $command"

    mkdir -p /var/personal_data/kerio/operator

    rm -r /var/etc/kerio/operator/luks.container
    command="rm -r /var/etc/kerio/operator/luks.container"
dLog "$gtag $operation successful $command"

    rm -r /var/etc/kerio/operator/pdpassword
    command="rm -r /var/etc/kerio/operator/pdpassword"
dLog "$gtag $operation successful $command"
}


move_data_from_container(){
    operation=$1

    unlink /var/spool/asterisk/monitor
    unlink /var/spool/asterisk/voicemail
    unlink /var/operator/log
    unlink /var/lib/firebird/2.0/data/kts.fdb


    cp -a /var/personal_data/kerio/operator/monitor /var/spool/asterisk/monitor
    command="/var/spool/asterisk/monitor"
dLog "$gtag $operation successfully moved resource $command"

    cp -a /var/personal_data/kerio/operator/voicemail /var/spool/asterisk/voicemail
    command="/var/spool/asterisk/voicemail"
dLog "$gtag $operation successfully moved resource $command"

    cp -a /var/personal_data/kerio/operator/log /var/operator/log
    command="/var/operator/log"
dLog "$gtag $operation successfully moved resource $command"

    mv /var/personal_data/kerio/operator/kts.fdb /var/lib/firebird/2.0/data/kts.fdb
    command="/var/lib/firebird/2.0/data/kts.fdb"
dLog "$gtag $operation successfully moved resource $command"
}

manage_reboot(){
pass=$1
stop_service

if [ -e /var/personal_data/kerio/operator/kts.fdb ]; then
   unlink /var/lib/firebird/2.0/data/kts.fdb
   mv /var/personal_data/kerio/operator/kts.fdb /var/lib/firebird/2.0/data/kts.fdb
elif [ ! -e /var/personal_data/kerio/operator/kts.fdb ]; then
   modprobe loop
   pass=`cat /var/etc/kerio/operator/pdpassword`
   echo -n $pass|cryptsetup luksOpen /var/etc/kerio/operator/luks.container luks -
   mount /dev/mapper/luks /var/personal_data/kerio/operator/
   mv /var/lib/firebird/2.0/data/kts.fdb /var/personal_data/kerio/operator/kts.fdb
   ln -s /var/personal_data/kerio/operator/kts.fdb /var/lib/firebird/2.0/data/kts.fdb
   /etc/boxinit.d/ksyslog restart
fi

start_service

}

stop_service(){
    /etc/boxinit.d/firebird stop
    /etc/boxinit.d/asterisk stop
    echo "Stopping services"
}

start_service(){
    /etc/boxinit.d/firebird start
    /etc/boxinit.d/asterisk start
    echo "starting services"
}


execute_actual(){

action=$1
volumeSize=$2
password=`cat /var/etc/kerio/operator/pdpassword`

#action = 0 encrypt content
#action = 2 encrypt increase
#action = 3 encrypt decrease
#action = 1 decrypt content
#action = reboot #Will run on reboot
if [[ $action = 0 ]]; then
    manageResourceForEncryption $volumeSize $password "Encryption"
elif [[ $action = 2 ]]; then
    resize_increase $volumeSize $password "Resize: increase"
elif [[ $action = 3 ]]; then
    resize_decrease $volumeSize $password "Resize: decrease"
elif [[ $action = 1 ]]; then
    manageResourceForDecryption "Decryption"
elif [[ $action = "reboot" ]]; then
    manage_reboot $password
fi

}

#date '+%-d/%b/%Y %H:%M:%S'
#script start
mount -o remount,rw /
if [ ! -L /etc/boxrc.d/123manage_reboot ]; then
    echo "#!/bin/bash" > /opt/kerio/operator/bin/manage_reboot.sh 
    echo "/opt/kerio/operator/bin/dataEncryption.sh reboot" >> /opt/kerio/operator/bin/manage_reboot.sh 
    chmod +x  /opt/kerio/operator/bin/manage_reboot.sh
    ln -s /opt/kerio/operator/bin/manage_reboot.sh /etc/boxrc.d/123manage_reboot
fi 

gtag='{Data Encryption}'
execute_actual $1 $2 
