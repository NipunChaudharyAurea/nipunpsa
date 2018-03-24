stop_service(){
    /etc/boxinit.d/ksyslog stop
    /etc/boxinit.d/webserver stop
    /etc/boxinit.d/asterisk stop
    /etc/boxinit.d/firebird stop
    echo "Stopping services"
}

start_service(){
    /etc/boxinit.d/firebird start
    /etc/boxinit.d/asterisk start
    /etc/boxinit.d/webserver start
    /etc/boxinit.d/ksyslog start
    echo "starting services"
}
action=$1

if [[ $action = "stop" ]]; then
   stop_service
elif [[ $action = "start" ]]; then
   start_service
fi
