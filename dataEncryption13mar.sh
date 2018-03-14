#!/bin/bash

#. util.sh

manageResourceForEncryption(){
    echo "0" > /var/etc/kerio/operator/inprogress
    #start encryption
    status="work in progress"

    echo  "" > /tmp/manageResourceForEncryption_cleanup
    pass=$2
    mkdir -p /var/spool/asterisk/{voicemail,monitor}
    dd if=/dev/zero of=/var/spool/asterisk/monitor/moni bs=512 count=11000
    dd if=/dev/zero of=/var/spool/asterisk/voicemail/voice bs=512 count=13000

    count=$1
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
    echo "0" >  /var/etc/kerio/operator/done
}

resize_increase(){
    echo "2" > /var/etc/kerio/operator/inprogress
    #start increasing the volume size for calculate number of cylinder counts

    pass=$2
    block_count=$1
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
    echo "2" > /var/etc/kerio/operator/done
}

resize_decrease(){
    echo "3" > /var/etc/kerio/operator/inprogress
    #start decreasing the volume size for calculate number of cylinder counts

    pass=$2
    block_count=$1
    stop_service
    move_data_from_container
    remove_container
    create_container $block_count $pass 
    move_data_to_container
    
    status='{"result": {"status": "encrypted","action": "decreasing container size","progress": {"current": 90,"total": 100}}}'
    echo "$status">/var/etc/kerio/operator/encryptionStatus
    start_service
    rm /var/etc/kerio/operator/inprogress
    echo "3" > /var/etc/kerio/operator/done
}

manageResourceForDecryption(){
    echo "1" > /var/etc/kerio/operator/inprogress
    #start decryption

    stop_service
    move_data_from_container
    remove_container
    start_service

    rm -r /var/etc/kerio/operator/pdenabled
    #end decryption
    status='{"result": {"status": "decrypted"}}'
    echo "$status">/var/etc/kerio/operator/encryptionStatus
    rm /var/etc/kerio/operator/inprogress
    echo "1" > /var/etc/kerio/operator/done
}

move_data_to_container(){
    if [ ! -d /tmp/monitor ]; then
       cp -a /var/spool/asterisk/monitor/ /tmp/
       cp -a /var/spool/asterisk/monitor/ /var/personal_data/kerio/operator/
    fi

    if [ ! -d /tmp/voicemail ]; then
       cp -a /var/spool/asterisk/voicemail/ /tmp/
       cp -a /var/spool/asterisk/voicemail/ /var/personal_data/kerio/operator/
    fi

#    cp -a /var/operator/log /var/personal_data/kerio/operator/log
#    mv /var/lib/firebird/2.0/data/kts.fdb /var/personal_data/kerio/operator/kts.fdb
     
    rm -rf /var/spool/asterisk/monitor/
    rm -rf /var/spool/asterisk/voicemail/
#    rm -rf /var/operator/log

    ln -sf /var/personal_data/kerio/operator/monitor /var/spool/asterisk/monitor
    ln -sf /var/personal_data/kerio/operator/voicemail /var/spool/asterisk/voicemail
#    ln -s /var/personal_data/kerio/operator/log /var/operator/log
#    ln -s /var/personal_data/kerio/operator/kts.fdb /var/lib/firebird/2.0/data/kts.fdb

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
    umount /var/personal_data/kerio/operator/
    cryptsetup luksClose luks
    rm -r /var/personal_data/kerio/operator/
    rm -r /var/etc/kerio/operator/luks.container
    rm -r /var/etc/kerio/operator/pdpasswd
}


move_data_from_container(){

    unlink /var/spool/asterisk/monitor
    unlink /var/spool/asterisk/voicemail
#    unlink /var/operator/log
#    unlink /var/lib/firebird/2.0/data/kts.fdb

    cp -a /var/personal_data/kerio/operator/monitor /var/spool/asterisk/
    cp -a /var/personal_data/kerio/operator/voicemail /var/spool/asterisk/
#    cp -a /var/personal_data/kerio/operator/log /var/operator/log
#    mv /var/personal_data/kerio/operator/kts.fdb /var/lib/firebird/2.0/data/kts.fdb
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




#script start
action=$1
volumeSize=$2
password=$3

#action = 0 encrypt content
#action = 1 decrypt content
if [[ $action = 0 ]]; then
    manageResourceForEncryption $volumeSize $password 
elif [[ $action = 2 ]]; then
    resize_increase $volumeSize $password 
elif [[ $action = 3 ]]; then
    resize_decrease $volumeSize $password
elif [[ $action = 1 ]]; then
    manageResourceForDecryption
else
    restore_previous_state $1
fi

