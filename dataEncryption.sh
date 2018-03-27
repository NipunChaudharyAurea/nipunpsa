#!/bin/bash

. util.sh

declare -r ACTION='Remove_Container'
declare -r LUKS_CONTAINER_PATH='/var/etc/kerio/operator/luks.container'
declare -r PERSONAL_DATA_DIR='/var/personal_data/kerio/operator'
declare -r VAR_OPERATOR_DIR='/var/etc/kerio/operator'
declare -r INIT_DIR='/etc/boxinit.d'
declare -r FIREBIRD_DB='/var/lib/firebird/2.0/data/kts.fdb'
declare -r ASTERISK_DIR='/var/spool/asterisk'
declare -r GTAG='{Data Encryption}'


update_status() {
       if [ $1 = 0 ]; then
           dLog "$GTAG $operation successful $2"
       else
           dLog "$GTAG $operation failed $2"
       fi 
       }    

manageResourceForEncryption(){
    #start encryption

    pass=$2
    count=$1
    operation=$3

    create_container $count $pass $operation
    move_data_to_container $operation
    touch $VAR_OPERATOR_DIR/pdenabled
    status='{"status":"encrypted"}'
    echo $status > $VAR_OPERATOR_DIR/encryptionStatus
    dLog "Personal data encryption is enabled."
}

resize_increase(){
    block_count=$1
    pass=$2
    operation=$3

    #start increasing the volume size for calculate number of cylinder counts

    if  ! grep -qs $PERSONAL_DATA_DIR /proc/mounts; then
        manage_reboot $pass
    fi
    
    unmount_resource $operation

    cryptsetup luksClose luks
    cmd_status=$(echo $?)

    dd if=/dev/zero bs=512 of=$LUKS_CONTAINER_PATH conv=notrunc oflag=append count=$block_count
    cmd_status=$(echo $?)
    command="dd if=/dev/zero bs=512 of=$LUKS_CONTAINER_PATH conv=notrunc oflag=append count=$block_count"
update_status cmd_status "$command"
    
    echo -n $pass|cryptsetup luksOpen $LUKS_CONTAINER_PATH luks -

    e2fsck -f /dev/mapper/luks

    resize2fs -f /dev/mapper/luks
    cmd_status=$(echo $?)
    command="resize2fs /dev/mapper/luks"
update_status cmd_status "$command"

    mount /dev/mapper/luks $PERSONAL_DATA_DIR

    $INIT_DIR/asterisk start
    $INIT_DIR/firebird start
    $INIT_DIR/ksyslog  start

}

resize_decrease(){
    block_count=$1
    pass=$2
    operation=$3

    #start decreasing the volume size for calculate number of cylinder counts
    
    if  ! grep -qs $PERSONAL_DATA_DIR /proc/mounts; then
        manage_reboot $pass
    fi

    move_data_from_container $operation
    remove_container $operation
    create_container $block_count $pass $operation 
    move_data_to_container $operation

}

manageResourceForDecryption(){
    #start decryption
    operation="$1"

    move_data_from_container $operation
    
    remove_container $operation

    rm -r $VAR_OPERATOR_DIR/pdenabled
    cmd_status=$(echo $?)
    command="rm -r $VAR_OPERATOR_DIR/pdenabled"
update_status cmd_status "$command"
    
    rm -r $VAR_OPERATOR_DIR/pdpassword
    cmd_status=$(echo $?)
    command="rm -r $VAR_OPERATOR_DIR/pdpassword"
update_status cmd_status "$command"
   
    status='{"status":"decrypted"}'
    echo $status > $VAR_OPERATOR_DIR/encryptionStatus
    dLog "Personal data encryption is disabled."
    $INIT_DIR/firebird start
}

create_container(){
    block_count=$1
    pass=$2
    operation="$3"

       dd if=/dev/zero of=$LUKS_CONTAINER_PATH bs=512 count=$block_count
       cmd_status=$(echo $?)
       command="dd if=/dev/zero of=$LUKS_CONTAINER_PATH bs=512 count=$no_of_blocks"
       update_status cmd_status "$command"

       echo -n  $pass|cryptsetup -q luksFormat $LUKS_CONTAINER_PATH -
       cmd_status=$(echo $?)
       command="cryptsetup -q luksFormat $LUKS_CONTAINER_PATH" 
update_status cmd_status "$command"

       echo -n $pass|cryptsetup luksOpen $LUKS_CONTAINER_PATH luks -
       cmd_status=$(echo $?)
       command="cryptsetup luksOpen $LUKS_CONTAINER_PATH luks"
update_status cmd_status "$command"

       mkfs.ext4 -j /dev/mapper/luks
       cmd_status=$(echo $?)
       command="mkfs.ext4 -j /dev/mapper/luks"
update_status cmd_status "$command"

       mkdir -p $PERSONAL_DATA_DIR

       mount /dev/mapper/luks $PERSONAL_DATA_DIR
       cmd_status=$(echo $?)
       command="mount /dev/mapper/luks $PERSONAL_DATA_DIR"
update_status cmd_status "$command"
}

move_data_to_container(){
    operation="$1" 

    
    if [ -f $FIREBIRD_DB ]; then
        $INIT_DIR/firebird stop
        mv $FIREBIRD_DB $PERSONAL_DATA_DIR/kts.fdb
        cmd_status=$(echo $?)
        command="mv $FIREBIRD_DB $PERSONAL_DATA_DIR/kts.fdb"
update_status cmd_status "$command"

        ln -s $PERSONAL_DATA_DIR/kts.fdb $FIREBIRD_DB
        cmd_status=$(echo $?)
        command="ln -s $PERSONAL_DATA_DIR/kts.fdb $FIREBIRD_DB"
update_status cmd_status "$command"
        $INIT_DIR/firebird start
    fi
    

    
    $INIT_DIR/asterisk stop
    cp -a $ASTERISK_DIR/monitor/ $PERSONAL_DATA_DIR/monitor/
    cmd_status=$(echo $?)
    command="cp -a $ASTERISK_DIR/monitor/ $PERSONAL_DATA_DIR/monitor/"
update_status cmd_status "$command" 
    
    cp -a $ASTERISK_DIR/voicemail/ $PERSONAL_DATA_DIR/voicemail/
    cmd_status=$(echo $?)
    command="cp -a $ASTERISK_DIR/voicemail/ $PERSONAL_DATA_DIR/voicemail/"
update_status cmd_status "$command"
     
     rm -rf $ASTERISK_DIR/monitor/
     rm -rf $ASTERISK_DIR/voicemail/

     ln -s $PERSONAL_DATA_DIR/monitor $ASTERISK_DIR/monitor
     cmd_status=$(echo $?)
     command="ln -s $PERSONAL_DATA_DIR/monitor $ASTERISK_DIR/monitor"
update_status cmd_status "$command"

    ln -s $PERSONAL_DATA_DIR/voicemail $ASTERISK_DIR/voicemail
    cmd_status=$(echo $?)
    command="ln -s $PERSONAL_DATA_DIR/voicemail $ASTERISK_DIR/voicemail"
update_status cmd_status "$command"
    $INIT_DIR/asterisk start
     
    $INIT_DIR/ksyslog  stop

    cp -a /var/operator/log $PERSONAL_DATA_DIR/log
    rm -rf /var/operator/log
    ln -s $PERSONAL_DATA_DIR/log /var/operator/log
    cmd_status=$(echo $?)
    command="ln -s $PERSONAL_DATA_DIR/log /var/operator/log"
update_status cmd_status "$command"
    $INIT_DIR/ksyslog  start

}

unmount_resource(){
  purpose="$1"
  if [ "$purpose" != "$ACTION" ]; then
        $INIT_DIR/asterisk stop
        $INIT_DIR/firebird stop
        pkill -9 fbserver
        pkill -u asterisk
        sleep 1
  fi    
       $INIT_DIR/ksyslog  stop
       pkill -9 ksyslog 
       error=$(umount $PERSONAL_DATA_DIR 2>&1 || ! grep -qs $PERSONAL_DATA_DIR /proc/mounts)
       stat=$(echo $?)
        $INIT_DIR/ksyslog  start
       if [ $stat != 0 ]; then
          eLog "Unmount Failed with Following Error:"
          eLog "$error"
          eLog "lsof out as follows :"
              lsof_output=$(lsof $PERSONAL_DATA_DIR) 
          eLog "$lsof_output"
          eLog "$1 Failed"
          eLog "Error while umounting the resource, Hence exiting. Please try again"
          if [ $1 == "Removing Container" ]; then
              move_data_to_container
          fi    
          exit 123
       else
          dLog "Unmounted the resourse successfully for $1" 
       fi    
}

move_data_from_container(){
    operation=$1
  
    $INIT_DIR/asterisk stop

    unlink $ASTERISK_DIR/monitor
    unlink $ASTERISK_DIR/voicemail

    cp -a $PERSONAL_DATA_DIR/monitor $ASTERISK_DIR/monitor
    cmd_status=$(echo $?)
    command="$ASTERISK_DIR/monitor"
update_status cmd_status "$command"

    cp -a $PERSONAL_DATA_DIR/voicemail $ASTERISK_DIR/voicemail
    cmd_status=$(echo $?)
    command="$ASTERISK_DIR/voicemail"
update_status cmd_status "$command"

    $INIT_DIR/asterisk start
   
    $INIT_DIR/ksyslog  stop

    unlink /var/operator/log
    cp -a $PERSONAL_DATA_DIR/log /var/operator/log

    $INIT_DIR/ksyslog  start
    cmd_status=$(echo $?)
    command="/var/operator/log"
update_status cmd_status "$command"
    $INIT_DIR/firebird stop

     if [ -L $FIREBIRD_DB ]; then
         unlink $FIREBIRD_DB
     fi 

     if [ ! -f $FIREBIRD_DB ]; then
           mv $PERSONAL_DATA_DIR/kts.fdb $FIREBIRD_DB
     fi 
    $INIT_DIR/firebird start
    cmd_status=$(echo $?)
    command="Firebird start"
update_status cmd_status "$command"

}

remove_container(){
    operation=$1
    
    unmount_resource "$ACTION"
    cmd_status=$(echo $?)
    command="umount  $PERSONAL_DATA_DIR/"
update_status cmd_status "$command"
    
    cryptsetup luksClose luks
    cmd_status=$(echo $?)
    command="cryptsetup luksClose luks"
update_status cmd_status "$command"
    
    rm -r $PERSONAL_DATA_DIR/
    cmd_status=$(echo $?)
    command="rm -r $PERSONAL_DATA_DIR/"
update_status cmd_status "$command"
    
    mkdir -p $PERSONAL_DATA_DIR
    
    rm -r $LUKS_CONTAINER_PATH
    cmd_status=$(echo $?)
    command="rm -r $LUKS_CONTAINER_PATH"
update_status cmd_status "$command"

}

manage_reboot(){
pass=$1

if [ -e $PERSONAL_DATA_DIR/kts.fdb ]; then
    
    $INIT_DIR/firebird stop

  if [ -L $FIREBIRD_DB ]; then
       rm -f  $FIREBIRD_DB
       mv $PERSONAL_DATA_DIR/kts.fdb $FIREBIRD_DB
  fi 

    $INIT_DIR/firebird start

elif [ ! -e $PERSONAL_DATA_DIR/kts.fdb ] && [ -f $VAR_OPERATOR_DIR/pdenabled ]; then
   pass=$(cat $VAR_OPERATOR_DIR/pdpassword)

   if [ ! -z "$pass" ]; then
       echo -n $pass|cryptsetup luksOpen $LUKS_CONTAINER_PATH luks -
       mount /dev/mapper/luks $PERSONAL_DATA_DIR/
       $INIT_DIR/firebird stop
       mv $FIREBIRD_DB $PERSONAL_DATA_DIR/kts.fdb
       ln -s $PERSONAL_DATA_DIR/kts.fdb $FIREBIRD_DB
       $INIT_DIR/firebird start
   fi

fi

}

execute_actual(){
modprobe loop
action=$1

if [[ ! -z "$3" ]]; then
   volumeSize=$(expr $2 \* 2 + 1)
fi
pfile="$VAR_OPERATOR_DIR/pdpassword"
password=$2

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
    modprobe -r loop
elif [[ $action = "reboot" ]]; then
    manage_reboot $password
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

execute_actual $1 $2
$INIT_DIR/ksyslog  restart
