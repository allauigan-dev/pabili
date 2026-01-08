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

/**
 * Helper to inject images into SQL insert statements
 */
function injectImages(sql) {
    let result = sql;

    // Process each table insert separately to avoid cross-table regex interference
    result = result.replace(/INSERT INTO (\w+) \(([^)]+)\) VALUES([\s\S]+?);/gi, (match, table, columns, values) => {
        let newColumns = columns;
        let newValues = values;
        const tableName = table.toLowerCase();

        if (tableName === 'stores') {
            // Insert image columns before created_at
            newColumns = newColumns.replace(/created_at/, 'store_logo, store_cover, created_at');
            newValues = newValues.replace(/\(([\s\S]+?)\)/g, (rowMatch, rowItems) => {
                // Find the last datetime() call - need to match the whole datetime(...) including nested parens
                // Split by commas and find the last part that contains datetime
                const parts = rowItems.split(',');
                let dtIndex = -1;
                for (let i = parts.length - 1; i >= 0; i--) {
                    if (parts[i].trim().startsWith('datetime(')) {
                        dtIndex = i;
                        break;
                    }
                }

                if (dtIndex === -1) return rowMatch;

                const prefix = parts.slice(0, dtIndex).join(',');
                const dt = ',' + parts.slice(dtIndex).join(',');

                const valueParts = prefix.split(',').map(p => p.trim());
                const storeName = (valueParts[1] || 'store').replace(/'/g, '');
                const seed = storeName.replace(/\s+/g, '-').toLowerCase();
                const logo = `https://picsum.photos/seed/${seed}-logo/200/200`;
                const cover = `https://picsum.photos/seed/${seed}-cover/800/400`;

                return `(${prefix}, '${logo}', '${cover}'${dt})`;
            });
        }
        else if (tableName === 'customers') {
            newColumns = newColumns.replace(/created_at/, 'customer_photo, created_at');
            newValues = newValues.replace(/\(([\s\S]+?)\)/g, (rowMatch, rowItems) => {
                const parts = rowItems.split(',');
                let dtIndex = -1;
                for (let i = parts.length - 1; i >= 0; i--) {
                    if (parts[i].trim().startsWith('datetime(')) {
                        dtIndex = i;
                        break;
                    }
                }
                if (dtIndex === -1) return rowMatch;

                const prefix = parts.slice(0, dtIndex).join(',');
                const dt = ',' + parts.slice(dtIndex).join(',');

                const valueParts = prefix.split(',').map(p => p.trim());
                const customerName = (valueParts[1] || 'customer').replace(/'/g, '');
                const seed = customerName.replace(/\s+/g, '-').toLowerCase();
                const photo = `https://picsum.photos/seed/${seed}/200/200`;

                return `(${prefix}, '${photo}'${dt})`;
            });
        }
        else if (tableName === 'orders') {
            newColumns = newColumns.replace(/created_at/, 'order_image, created_at');
            newValues = newValues.replace(/\(([\s\S]+?)\)/g, (rowMatch, rowItems) => {
                const parts = rowItems.split(',');
                let dtIndex = -1;
                for (let i = parts.length - 1; i >= 0; i--) {
                    if (parts[i].trim().startsWith('datetime(')) {
                        dtIndex = i;
                        break;
                    }
                }
                if (dtIndex === -1) return rowMatch;

                const prefix = parts.slice(0, dtIndex).join(',');
                const dt = ',' + parts.slice(dtIndex).join(',');

                const valueParts = prefix.split(',').map(p => p.trim());
                // For orders, name is at index 2
                const orderName = (valueParts[2] || 'order').replace(/'/g, '');
                const seed = orderName.replace(/\s+/g, '-').toLowerCase();
                const image = `https://picsum.photos/seed/${seed}/400/400`;

                return `(${prefix}, '${image}'${dt})`;
            });
        }
        else if (tableName === 'payments') {
            newColumns = newColumns.replace(/created_at/, 'payment_proof, created_at');
            newValues = newValues.replace(/\(([\s\S]+?)\)/g, (rowMatch, rowItems) => {
                const parts = rowItems.split(',');
                let dtIndex = -1;
                for (let i = parts.length - 1; i >= 0; i--) {
                    if (parts[i].trim().startsWith('datetime(')) {
                        dtIndex = i;
                        break;
                    }
                }
                if (dtIndex === -1) return rowMatch;

                const prefix = parts.slice(0, dtIndex).join(',');
                const dt = ',' + parts.slice(dtIndex).join(',');

                const seed = Math.random().toString(36).substring(7);
                const proof = `https://picsum.photos/seed/${seed}/400/600`;

                return `(${prefix}, '${proof}'${dt})`;
            });
        }

        return `INSERT INTO ${table} (${newColumns}) VALUES${newValues};`;
    });

    return result;
}

// Apply image injection
let newSeed = injectImages(seedSql);
let newOrders = injectImages(seedOrdersSql);


// Replace Organization ID
newSeed = newSeed.replace(/'UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF'/g, `'${ORG_ID}'`);
newOrders = newOrders.replace(/'UanXEuWbmBOJXRlemM1m8f4LTVEhnuyF'/g, `'${ORG_ID}'`);

// Replace Store and Customer IDs in orders
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

