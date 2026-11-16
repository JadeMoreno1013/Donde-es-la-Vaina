const passwordService = require('../services/password.service');
const userDao = require('../dao/user.dao');
const { pool } = require('../services/mysql.service');

const BCRYPT_HASH_PATTERN = /^\$2[aby]\$\d{2}\$/;

const migratePasswords = async () => {
    const users = await userDao.findAllCredentials();
    const pendingUsers = users.filter((user) => !BCRYPT_HASH_PATTERN.test(user.password));
    for (const user of pendingUsers) {
        const passwordHash = await passwordService.hash(user.password);
        await userDao.updatePassword(user.id_user, passwordHash);
    }
    console.log(`Passwords migrated: ${pendingUsers.length} of ${users.length} users`);
};

migratePasswords()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(() => pool.end());
