#!/bin/bash

. util.sh

manageResourceForEncryption(){
    #start encryption

    pass=$2
    count=$1
    stop_service
    create_container $count $pass
    move_data_to_container
    start_service
    touch /var/etc/kerio/operator/pdenabled
}

resize_increase(){
    block_count=$1

    #start increasing the volume size for calculate number of cylinder counts

    stop_service
    dd if=/dev/zero bs=512 of=/var/etc/kerio/operator/luks.container conv=notrunc oflag=append count=$block_count
    losetup -c /dev/loop0
    cryptsetup -b $block_count resize luks
    resize2fs /dev/mapper/luks
    start_service

}

resize_decrease(){
    pass=$2
    block_count=$1

    #start decreasing the volume size for calculate number of cylinder counts

    stop_service
    move_data_from_container
    remove_container
    create_container $block_count $pass
    move_data_to_container

}

manageResourceForDecryption(){
    #start decryption

    stop_service
    move_data_from_container
    remove_container
    start_service
    rm -r /var/etc/kerio/operator/pdenabled
}

move_data_to_container(){
    cp -a /var/spool/asterisk/monitor/ /var/personal_data/kerio/operator/monitor/
    cp -a /var/spool/asterisk/voicemail/ /var/personal_data/kerio/operator/voicemail/
    cp -a /var/operator/log /var/personal_data/kerio/operator/log
    mv /var/lib/firebird/2.0/data/kts.fdb /var/personal_data/kerio/operator/kts.fdb

    rm -rf /var/spool/asterisk/monitor/
    rm -rf /var/spool/asterisk/voicemail/
    rm -rf /var/operator/log

    ln -s /var/personal_data/kerio/operator/monitor /var/spool/asterisk/monitor
    ln -s /var/personal_data/kerio/operator/voicemail /var/spool/asterisk/voicemail
    ln -s /var/personal_data/kerio/operator/log /var/operator/log
    ln -s /var/personal_data/kerio/operator/kts.fdb /var/lib/firebird/2.0/data/kts.fdb

}

create_container(){
    no_of_blocks=$1
    pass=$2

       dd if=/dev/zero of=/var/etc/kerio/operator/luks.container bs=512 count=$no_of_blocks
       echo -n  $pass|cryptsetup -q luksFormat /var/etc/kerio/operator/luks.container -
       echo -n $pass|cryptsetup luksOpen /var/etc/kerio/operator/luks.container luks -
       mkfs.ext4 -j /dev/mapper/luks
       mkdir -p /var/personal_data/kerio/operator
       mount /dev/mapper/luks /var/personal_data/kerio/operator/
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
    unlink /var/operator/log
    unlink /var/lib/firebird/2.0/data/kts.fdb

    cp -a /var/personal_data/kerio/operator/monitor /var/spool/asterisk/monitor
    cp -a /var/personal_data/kerio/operator/voicemail /var/spool/asterisk/voicemail
    cp -a /var/personal_data/kerio/operator/log /var/operator/log
    mv /var/personal_data/kerio/operator/kts.fdb /var/lib/firebird/2.0/data/kts.fdb
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
password=$3

#action = 0 encrypt content
#action = 2 encrypt increase
#action = 3 encrypt decrease
#action = 1 decrypt content

if [[ $action = 0 ]]; then
    manageResourceForEncryption $volumeSize $password
elif [[ $action = 2 ]]; then
    resize_increase $volumeSize
elif [[ $action = 3 ]]; then
    resize_decrease $volumeSize $password
elif [[ $action = 1 ]]; then
    manageResourceForDecryption
fi

}
#date '+%-d/%b/%Y %H:%M:%S'
#script start
passwd=`cat /var/etc/kerio/operator/pdpassword`

execute_actual $1 $2 $passwd

