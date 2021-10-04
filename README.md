# ActiveQueryListing3

Active Query Listing 3 for MySQL (NodeJS)

For a successful run *my* Fedora 33 system, I did the following: (your mileage may vary)

```
$ sudo dnf install -y nodejs npm redis
$ sudo systemctl enable redis
$ sudo systemctl start redis
$ sudo mysql_secure_installation
... answer all the questions appropriately ...
$ sudo mysql
... black magic to set up mysql - yes - this could be a better explanation ...
$ npm i
... Installs modules from packages.json ...

```
Check setup_db.sql for MySQL setup instructions

For MariaDB:
```
GRANT PROCESS, SLAVE MONITOR ON *.* TO 'app_aql'@'127.0.0.1' IDENTIFIED VIA mysql_native_password USING PASSWORD('FIXME!') OR unix_socket ;
GRANT ALL ON aql3_db.* TO 'app_aql'@'127.0.0.1' ;
source setup_db.sql
