const bcrypt = require('bcryptjs');
const securityConfig = require('../env/securityConfig');

const hash = (plainPassword) => bcrypt.hash(plainPassword, securityConfig.saltRounds);

const verify = (plainPassword, storedHash) => bcrypt.compare(plainPassword, storedHash);

module.exports = { hash, verify };
