import random
import string


#allowed string constants
allowedChars = string.ascii_letters + string.digits

#genereate password
def generate_password(length=20):
    return ''.join(random.choice(allowedChars) for _ in range(length))

# create users/passwords
users = {}
for u in ['postgres', 'collector', 'worker', 'reader']:
    users[u] = {
        'password': generate_password(),
        'username': f'obj_{u}',
        'role': f'obj_{u}_role'
    }

# write SQL
with open('auth.sql', 'w+') as f:
    for u in users.values():
        if u['username'] == 'obj_postgres':
            continue
        sql = (
            f"create user {u['username']} with password '{u['password']}' inherit;\n"
            f"grant {u['role']} to {u['username']};\n")
        f.write(sql)

# write env for collector
for e in ['postgres', 'collector', 'worker']:
    user = users[e]
    env_file = f'pg_env_{e}'
    with open(env_file, 'w+') as f:
        env = (
            f"POSTGRES_USER={user['username']}\n"
            f"POSTGRES_PASSWORD={user['password']}\n"
            f"POSTGRES_DB=objectiv\n"
            f"POSTGRES_HOSTNAME=postgres\n"
            f"POSTGRES_PORT=5432\n"
        )
        f.write(env)

