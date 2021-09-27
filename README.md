# ActiveQueryListing3

Active Query Listing 3 for MySQL (NodeJS)

For a successful run *my* Fedora 33 system, I did the following: (your mileage may vary)

```
$ sudo dnf install -y node npm redis
$ sudo systemctl enable redis
$ sudo systemctl start redis
$ sudo mysql_secure_installation
... answer all the questions appropriately ...
$ sudo mysql
... black magic to set up mysql - yes - this could be a better explanation ...
$ npm i
... Installs modules from packages.json ...

```
