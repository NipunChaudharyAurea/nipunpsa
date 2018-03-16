#!/bin/bash

#. util.sh

manageResourceForEncryption(){
    echo "0 $1" > /var/etc/kerio/operator/inprogress
    pass=$2
    count=$1

    #start encryption
    status="work in progress"

    mkdir -p /var/spool/asterisk/{voicemail,monitor}
    dd if=/dev/zero of=/var/spool/asterisk/monitor/moni bs=512 count=11000
    dd if=/dev/zero of=/var/spool/asterisk/voicemail/voice bs=512 count=13000

    stop_service
    create_container $count $pass
    move_data_to_container
    start_service

    touch /var/etc/kerio/operator/pdenabled

    #end encryption update status now
    status='{"result": {"status": "encrypted"}}'
    echo "$status">/var/etc/kerio/operator/encryptionStatus
    echo "rm -rf /tmp/{voicemail,monitor}" >> /tmp/manageResourceForEncryption_cleanup
    rm -rf /tmp/{voicemail,monitor}
    rm /var/etc/kerio/operator/inprogress 
}

resize_increase(){
    echo "2 $1" > /var/etc/kerio/operator/inprogress
    pass=$2
    block_count=$1

    #start increasing the volume size for calculate number of cylinder counts

    status='{"result": {"status": "encrypted","action": "resizing","progress": {"current": 10,"total": 100}}}'
    echo "$status">/var/etc/kerio/operator/encryptionStatus

    stop_service
    dd if=/dev/zero bs=512 of=/var/etc/kerio/operator/luks.container conv=notrunc oflag=append count=$block_count
    losetup -c /dev/loop0
    cryptsetup -b $block_count resize luks
    resize2fs /dev/mapper/luks

    status='{"result": {"status": "encrypted","action": "increasing container size","progress": {"current": 10,"total": 100}}}'
    echo "$status">/var/etc/kerio/operator/encryptionStatus
    start_service
    rm /var/etc/kerio/operator/inprogress 
}

resize_decrease(){
    echo "3 $1" > /var/etc/kerio/operator/inprogress
    pass=$2
    block_count=$1

    #start decreasing the volume size for calculate number of cylinder counts

    stop_service
    move_data_from_container
    remove_container
    create_container $block_count $pass 
    move_data_to_container
    
    status='{"result": {"status": "encrypted","action": "decreasing container size","progress": {"current": 90,"total": 100}}}'
    echo "$status">/var/etc/kerio/operator/encryptionStatus
    start_service
    rm /var/etc/kerio/operator/inprogress 
}

manageResourceForDecryption(){
    echo "1" > /var/etc/kerio/operator/inprogress

    #start decryption

    stop_service
    move_data_from_container
    start_service

    rm -r /var/etc/kerio/operator/pdenabled
    #end decryption
    status='{"result": {"status": "decrypted"}}'
    echo "$status">/var/etc/kerio/operator/encryptionStatus
    rm /var/etc/kerio/operator/inprogress 
}

move_data_to_container(){
     if [ ! -e /var/etc/kerio/operator/copyout_end ]; then
        touch /var/etc/kerio/operator/copyout_start
        cp -a /var/spool/asterisk/monitor/ /var/personal_data/kerio/operator/
        cp -a /var/spool/asterisk/voicemail/ /var/personal_data/kerio/operator/
#       cp -a /var/operator/log /var/personal_data/kerio/operator/log
#    mv /var/lib/firebird/2.0/data/kts.fdb /var/personal_data/kerio/operator/kts.fdb
        mv /var/etc/kerio/operator/copy_start /var/etc/kerio/operator/copy_end
     fi 
    if [ -e /var/etc/kerio/operator/copy_end ]; then     
        rm -rf /var/spool/asterisk/monitor/
        rm -rf /var/spool/asterisk/voicemail/
#       rm -rf /var/operator/log
    else
        move_data_to_container
    fi

    ln -sf /var/personal_data/kerio/operator/monitor /var/spool/asterisk/monitor
    ln -sf /var/personal_data/kerio/operator/voicemail /var/spool/asterisk/voicemail
#    ln -s /var/personal_data/kerio/operator/log /var/operator/log
#    ln -s /var/personal_data/kerio/operator/kts.fdb /var/lib/firebird/2.0/data/kts.fdb

     rm /var/etc/kerio/operator/copyout_end
}

create_container(){
    no_of_blocks=$1
    pass=$2
    if [[ ! -e /var/etc/kerio/operator/luks.container ]]; then
       dd if=/dev/zero of=/var/etc/kerio/operator/luks.container bs=512 count=$no_of_blocks
       echo -n  $pass|cryptsetup -q luksFormat /var/etc/kerio/operator/luks.container - 
       echo -n $pass|cryptsetup luksOpen /var/etc/kerio/operator/luks.container luks - 
       mkfs.ext4 -j /dev/mapper/luks
    fi
    echo -n $pass|cryptsetup luksOpen /var/etc/kerio/operator/luks.container luks - 
    [ -d /var/personal_data/kerio/operator ] || mkdir -p /var/personal_data/kerio/operator
    if [ ! $(mountpoint -q /var/personal_data/kerio/operator) ]; then
       mount /dev/mapper/luks /var/personal_data/kerio/operator/
    fi
}

remove_container(){
    umount /var/personal_data/kerio/operator/ 2>/dev/null
    cryptsetup luksClose luks 2>/dev/null 
    rm -rf /var/personal_data/kerio/operator/
    rm -rf /var/etc/kerio/operator/luks.container
    rm -rf /var/etc/kerio/operator/pdpasswd
}


move_data_from_container(){

    unlink /var/spool/asterisk/monitor 2>/dev/null
    unlink /var/spool/asterisk/voicemail 2>/dev/null
#    unlink /var/operator/log
#    unlink /var/lib/firebird/2.0/data/kts.fdb
 
    if [ ! -e /var/etc/kerio/operator/copyin_end ]; then
       touch /var/etc/kerio/operator/copyin_start
       cp -a /var/personal_data/kerio/operator/monitor /var/spool/asterisk/
       cp -a /var/personal_data/kerio/operator/voicemail /var/spool/asterisk/
#      cp -a /var/personal_data/kerio/operator/log /var/operator/log
#      mv /var/personal_data/kerio/operator/kts.fdb /var/lib/firebird/2.0/data/kts.fdb
       mv /var/etc/kerio/operator/copyin_start  /var/etc/kerio/operator/copyin_end
   fi

   if [ -e /var/etc/kerio/operator/copyin_end ]; then
       remove_container 
   else
        move_data_from_container
   fi

}


stop_service(){
#    /etc/boxinit.d/firebird stop
#    /etc/boxinit.d/asterisk stop
    echo "Stopping services"
}

start_service(){
#    /etc/boxinit.d/firebird start
#    /etc/boxinit.d/asterisk start
    echo "starting services"
}


execute_actual(){

action=$1
volumeSize=$2
password=$3

#action = 0 encrypt content
#action = 2 encrypt increase
#action = 3 encrypt decrease
#action = 1 decrypt content

if [[ $action = 0 ]]; then
    manageResourceForEncryption $volumeSize $password 
elif [[ $action = 2 ]]; then
    resize_increase $volumeSize $password 
elif [[ $action = 3 ]]; then
    resize_decrease $volumeSize $password
elif [[ $action = 1 ]]; then
    manageResourceForDecryption
fi

}

#script start

passwd=`cat path-to-password-file`

if [ -e /var/etc/kerio/operator/inprogress ]; then
   action=`cat /var/etc/kerio/operator/inprogress|awk '{print $1}'`
   count=`cat /var/etc/kerio/operator/inprogress|awk '{print $2}'`
   execute_actual $action $count $passwd
fi

execute_actual $1 $2 $passwd
