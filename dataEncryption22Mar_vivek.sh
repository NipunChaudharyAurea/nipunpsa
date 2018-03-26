#!/bin/bash

. util.sh

modprobe loop
mount -o remount,rw /

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
    status='{"status":"encrypted"}'
    echo $status > /var/etc/kerio/operator/encryptionStatus
    sLog "Personal data encryption is enabled."
}

resize_increase(){
    block_count=$1
    pass=$2
    operation=$3

    #start increasing the volume size for calculate number of cylinder counts

    stop_service

    if [ ! grep -qs '/var/personal_data/kerio/operator/' /proc/mounts ]; then
        manage_reboot
    fi
    
    unmount_resource $operation

    cryptsetup luksClose luks

    dd if=/dev/zero bs=512 of=/var/etc/kerio/operator/luks.container conv=notrunc oflag=append count=$block_count
    command="dd if=/dev/zero bs=512 of=/var/etc/kerio/operator/luks.container conv=notrunc oflag=append count=$block_count"
sLog "$gtag $operation successful $command"
    
    echo -n $pass|cryptsetup luksOpen /var/etc/kerio/operator/luks.container luks -

    e2fsck -f /dev/mapper/luks

    resize2fs -f /dev/mapper/luks
    command="resize2fs /dev/mapper/luks"
sLog "$gtag $operation successful $command"

    mount /dev/mapper/luks /var/personal_data/kerio/operator/

    start_service

}

resize_decrease(){
    block_count=$1
    pass=$2
    operation=$3

    #start decreasing the volume size for calculate number of cylinder counts

    stop_service
    
    if [ ! grep -qs '/var/personal_data/kerio/operator/' /proc/mounts ]; then
        manage_reboot
    fi

    move_data_from_container $operation
    remove_container $operation
    create_container $block_count $pass $operation 
    move_data_to_container $operation
    start_service

}

manageResourceForDecryption(){
    #start decryption
    operation="$1"

    stop_service
    move_data_from_container $operation
    remove_container $operation
    start_service
    rm -r /var/etc/kerio/operator/pdenabled
    command="rm -r /var/etc/kerio/operator/pdenabled"
    sLog "$gtag $operation successful $command"
    
    rm -r /var/etc/kerio/operator/pdpassword
    command="rm -r /var/etc/kerio/operator/pdpassword"
sLog "$gtag $operation successful $command"
   
    status='{"status":"decrypted"}'
    echo $status > /var/etc/kerio/operator/encryptionStatus
    sLog "Personal data encryption is disabled."
}

create_container(){
    block_count=$1
    pass=$2
    operation="$3"

       dd if=/dev/zero of=/var/etc/kerio/operator/luks.container bs=512 count=$block_count
       command="dd if=/dev/zero of=/var/etc/kerio/operator/luks.container bs=512 count=$no_of_blocks"
sLog "$gtag $operation successful $command"

       echo -n  $pass|cryptsetup -q luksFormat /var/etc/kerio/operator/luks.container -
       command="cryptsetup -q luksFormat /var/etc/kerio/operator/luks.container" 
sLog "$gtag $operation successful $command"

       echo -n $pass|cryptsetup luksOpen /var/etc/kerio/operator/luks.container luks -
       command="cryptsetup luksOpen /var/etc/kerio/operator/luks.container luks"
sLog "$gtag $operation successful $command"

       mkfs.ext4 -j /dev/mapper/luks
       command="mkfs.ext4 -j /dev/mapper/luks"
sLog "$gtag $operation successful $command"

       mkdir -p /var/personal_data/kerio/operator

       mount /dev/mapper/luks /var/personal_data/kerio/operator/
       command="mount /dev/mapper/luks /var/personal_data/kerio/operator/"
sLog "$gtag $operation successful $command"
}

move_data_to_container(){
    operation="$1" 
   
    cp -a /var/spool/asterisk/monitor/ /var/personal_data/kerio/operator/monitor/
sLog "$gtag $operation successfully moved resource /var/spool/asterisk/monitor/" 

    cp -a /var/spool/asterisk/voicemail/ /var/personal_data/kerio/operator/voicemail/
sLog "$gtag $operation successfully moved resource /var/spool/asterisk/voicemail/" 

    cp -a /var/operator/log /var/personal_data/kerio/operator/log
sLog "$gtag $operation successfully moved resource /var/operator/log" 

    mv /var/lib/firebird/2.0/data/kts.fdb /var/personal_data/kerio/operator/kts.fdb
sLog "$gtag $operation successfully moved resource /var/lib/firebird/2.0/data/kts.fdb" 


    rm -rf /var/spool/asterisk/monitor/
    rm -rf /var/spool/asterisk/voicemail/
    rm -rf /var/operator/log

    ln -s /var/personal_data/kerio/operator/monitor /var/spool/asterisk/monitor
sLog "$gtag $operation successfully created symbolik link for /var/spool/asterisk/monitor/" 

    ln -s /var/personal_data/kerio/operator/voicemail /var/spool/asterisk/voicemail
sLog "$gtag $operation successfully created symbolik link for /var/spool/asterisk/voicemail/" 

    ln -s /var/personal_data/kerio/operator/log /var/operator/log
sLog "$gtag $operation successfully created symbolik link for /var/operator/log" 

    ln -s /var/personal_data/kerio/operator/kts.fdb /var/lib/firebird/2.0/data/kts.fdb
sLog "$gtag $operation successfully created symbolik link for /var/lib/firebird/2.0/data/kts.fdb" 

}

unmount_resource(){
        /etc/boxinit.d/ksyslog stop
       sleep 1  
       pkill -9 ksyslog
       error=$(umount /var/personal_data/kerio/operator 2>&1 || ! grep -qs '/var/personal_data/kerio/operator/' /proc/mounts)
       stat=$(echo $?)
        /etc/boxinit.d/ksyslog start
       if [ $stat != 0 ]; then
          sLog "Unmount Failed with Following Error:"
          sLog "$error"
          sLog "lsof out as follows :"
              lsof_output=$(lsof /var/personal_data/kerio/operator) 
          sLog "$lsof_output"
          sLog "$1 Failed"
          sLog "Error while umounting the resource, Hence exiting. Please try again"
          echo "$(date '+%-d/%b/%Y %H:%M:%S')  Unmount Failed with Following Error:" >> /root/encryp.log
          echo "$(date '+%-d/%b/%Y %H:%M:%S')  $error" >> /root/encryp.log
          echo "$(date '+%-d/%b/%Y %H:%M:%S')  lsof out as follows :" >> /root/encryp.log
              lsof_output=$(lsof /var/personal_data/kerio/operator) 
          echo "$(date '+%-d/%b/%Y %H:%M:%S')  $lsof_output" >> /root/encryp.log
          echo "$(date '+%-d/%b/%Y %H:%M:%S')  $1 Failed" >> /root/encryp.log
          echo "$(date '+%-d/%b/%Y %H:%M:%S')  Error while umounting the resource, Hence exiting. Please try again" >> /root/encryp.log
          if [ $1 == "Removing Container" ]; then
              move_data_to_container
          fi    
          start_service
          exit 123
       else
          sLog "Unmounted the resourse successfully for $1" 
          echo "$(date '+%-d/%b/%Y %H:%M:%S')  Unmounted the resourse successfully for $1"  >> /root/encryp.log
       fi
}

move_data_from_container(){
    operation=$1

    unlink /var/spool/asterisk/monitor
    unlink /var/spool/asterisk/voicemail
    unlink /var/operator/log
    rm -f  /var/lib/firebird/2.0/data/kts.fdb


    cp -a /var/personal_data/kerio/operator/monitor /var/spool/asterisk/monitor
    command="/var/spool/asterisk/monitor"
sLog "$gtag $operation successfully moved resource $command"

    cp -a /var/personal_data/kerio/operator/voicemail /var/spool/asterisk/voicemail
    command="/var/spool/asterisk/voicemail"
sLog "$gtag $operation successfully moved resource $command"

    cp -a /var/personal_data/kerio/operator/log /var/operator/log
    command="/var/operator/log"
sLog "$gtag $operation successfully moved resource $command"

    mv /var/personal_data/kerio/operator/kts.fdb /var/lib/firebird/2.0/data/kts.fdb
    command="/var/lib/firebird/2.0/data/kts.fdb"
sLog "$gtag $operation successfully moved resource $command"
}

remove_container(){
    operation=$1
    
    unmount_resource "Removing Container"
    
    command="umount  /var/personal_data/kerio/operator/"
sLog "$gtag $operation successful $command"
    
    cryptsetup luksClose luks
    command="cryptsetup luksClose luks"
sLog "$gtag $operation successful $command"
    
    rm -r /var/personal_data/kerio/operator/
    command="rm -r /var/personal_data/kerio/operator/"
sLog "$gtag $operation successful $command"
    
    mkdir -p /var/personal_data/kerio/operator
    
    rm -r /var/etc/kerio/operator/luks.container
    command="rm -r /var/etc/kerio/operator/luks.container"
sLog "$gtag $operation successful $command"

}

manage_reboot(){
pass=$1
stop_service

if [ -e /var/personal_data/kerio/operator/kts.fdb ]; then
   unlink /var/lib/firebird/2.0/data/kts.fdb
   mv /var/personal_data/kerio/operator/kts.fdb /var/lib/firebird/2.0/data/kts.fdb
elif [ ! -e /var/personal_data/kerio/operator/kts.fdb ]; then
   modprobe loop
   pass=$(cat /var/etc/kerio/operator/pdpassword)
   echo -n $pass|cryptsetup luksOpen /var/etc/kerio/operator/luks.container luks -
   mount /dev/mapper/luks /var/personal_data/kerio/operator/
   mv /var/lib/firebird/2.0/data/kts.fdb /var/personal_data/kerio/operator/kts.fdb
   ln -s /var/personal_data/kerio/operator/kts.fdb /var/lib/firebird/2.0/data/kts.fdb
fi

start_service

}

stop_service(){
    /etc/boxinit.d/asterisk stop
    /etc/boxinit.d/firebird stop
    echo "Stopping services"
}

start_service(){
    /etc/boxinit.d/firebird start
    /etc/boxinit.d/asterisk start
    echo "starting services"
}


execute_actual(){

action=$1

if [[ ! -z "$2" ]]; then
   volumeSize=$(expr $2 \* 3 + 1)
fi
pfile='/var/etc/kerio/operator/pdpassword'
password=$(cat $pfile 2>/dev/null)

#action = 0 encrypt content
#action = 2 encrypt increase
#action = 3 encrypt decrease
#action = 1 decrypt content
#action = reboot #Will run on reboot
if [[ $action = 0 ]]; then
    test -f $pfile && manageResourceForEncryption $volumeSize $password "Encryption"
elif [[ $action = 2 ]]; then
    test -f $pfile && resize_increase $volumeSize $password "Resize:increase"
elif [[ $action = 3 ]]; then
    test -f $pfile && resize_decrease $volumeSize $password "Resize:decrease"
elif [[ $action = 1 ]]; then
    manageResourceForDecryption "Decryption"
elif [[ $action = "reboot" ]]; then
    test -f $pfile && manage_reboot $password
fi

}

#date '+%-d/%b/%Y %H:%M:%S'
#script start

if [ ! -L /etc/boxrc.d/123manage_reboot ]; then
    echo "#!/bin/bash" > /opt/kerio/operator/bin/manage_reboot.sh 
    echo "/opt/kerio/operator/bin/dataEncryption.sh reboot" >> /opt/kerio/operator/bin/manage_reboot.sh 
    chmod +x  /opt/kerio/operator/bin/manage_reboot.sh
    ln -s /opt/kerio/operator/bin/manage_reboot.sh /etc/boxrc.d/123manage_reboot
fi 

gtag='{Data Encryption}'
execute_actual $1 $2 
/etc/boxinit.d/ksyslog restart
