const fs = require('fs');
const path = require('path');

const ORG_ID = process.argv[2];
const OFFSET = parseInt(process.argv[3] || '0');

if (!ORG_ID) {
    console.error('Usage: node generate-seed.js <ORG_ID> [OFFSET]');
    process.exit(1);
}

const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf-8');
const seedOrdersSql = fs.readFileSync(path.join(__dirname, 'seed-orders.sql'), 'utf-8');

// Replace Organization ID
let newSeed = seedSql.replace(/'UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF'/g, `'${ORG_ID}'`);
let newOrders = seedOrdersSql.replace(/'UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF'/g, `'${ORG_ID}'`);

// Replace Store and Customer IDs in orders
// Matches: , store_id, customer_id, datetime
if (OFFSET > 0) {
    // Run replacement for orders first with a very specific pattern
    newOrders = newOrders.replace(/INSERT INTO orders [\s\S]+?;/, (match) => {
        return match.replace(/, (\d+), (\d+), datetime/g, (m, s, c) => {
            return `, ${parseInt(s) + OFFSET}, ${parseInt(c) + OFFSET}, datetime`;
        });
    });

    // Run replacement for payments
    newOrders = newOrders.replace(/INSERT INTO payments [\s\S]+?;/g, (match) => {
        return match.replace(/, (\d+), datetime/g, (m, c) => {
            return `, ${parseInt(c) + OFFSET}, datetime`;
        });
    });
}

// Replace Order Numbers to avoid unique constraint violations
newOrders = newOrders.replace(/'ORD-(\d+)'/g, (match, num) => {
    return `'ORD-${ORG_ID.substring(0, 4)}-${num}'`;
});

console.log(newSeed);
console.log(newOrders);
