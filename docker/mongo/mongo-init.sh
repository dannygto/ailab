#!/bin/bash
set -e

# 创建管理员用户
mongo <<EOF
use admin
db.createUser({
  user: "$MONGO_INITDB_ROOT_USERNAME",
  pwd: "$MONGO_INITDB_ROOT_PASSWORD",
  roles: [{ role: "root", db: "admin" }]
})
EOF

# 创建应用数据库和用户
mongo <<EOF
use $MONGO_INITDB_DATABASE
db.createUser({
  user: "$MONGO_APP_USERNAME",
  pwd: "$MONGO_APP_PASSWORD",
  roles: [{ role: "readWrite", db: "$MONGO_INITDB_DATABASE" }]
})
EOF

echo "MongoDB初始化完成!"
