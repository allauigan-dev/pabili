const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

let ORG_ID = process.argv[2];
let OFFSET = process.argv[3] ? parseInt(process.argv[3]) : null;

function runWrangler(query) {
    try {
        const cmd = `npx wrangler d1 execute pabili-db --local --command="${query}" --json`;
        const output = execSync(cmd, { stdio: ['pipe', 'pipe', 'ignore'] }).toString();
        return JSON.parse(output);
    } catch (e) {
        return null;
    }
}

if (!ORG_ID) {
    console.warn('-- No ORG_ID provided, attempting to auto-detect...');
    const result = runWrangler("SELECT id, name FROM organization WHERE name NOT LIKE '%test%' AND id NOT LIKE '%test%' ORDER BY created_at DESC LIMIT 1");
    if (result && result[0] && result[0].results && result[0].results[0]) {
        ORG_ID = result[0].results[0].id;
        console.warn(`-- Auto-detected ORG_ID: ${ORG_ID} (${result[0].results[0].name})`);
    } else {
        console.error('Error: Could not find a suitable organization.');
        process.exit(1);
    }
}

if (OFFSET === null) {
    console.warn('-- No OFFSET provided, calculating from current database state...');
    const storeResult = runWrangler("SELECT MAX(id) as max_id FROM stores");
    const customerResult = runWrangler("SELECT MAX(id) as max_id FROM customers");
    let maxS = (storeResult && storeResult[0] && storeResult[0].results[0] && storeResult[0].results[0].max_id);
    let maxC = (customerResult && customerResult[0] && customerResult[0].results[0] && customerResult[0].results[0].max_id);
    if (maxS === "null" || maxS === null) maxS = 0;
    if (maxC === "null" || maxC === null) maxC = 0;
    OFFSET = Math.max(parseInt(maxS), parseInt(maxC));
    if (isNaN(OFFSET)) OFFSET = 0;
    console.warn(`-- Calculated OFFSET: ${OFFSET}`);
}

const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf-8');
const seedOrdersSql = fs.readFileSync(path.join(__dirname, 'seed-orders.sql'), 'utf-8');

function parseRows(values) {
    const rows = [];
    const rowRegex = /\(([^()]*|\([^()]*\))*\)/g;
    let match;
    while ((match = rowRegex.exec(values)) !== null) {
        const rowBody = match[0].substring(1, match[0].length - 1);
        const parts = [];
        let currentPart = '';
        let parenDepth = 0;
        for (let i = 0; i < rowBody.length; i++) {
            const char = rowBody[i];
            if (char === '(') parenDepth++;
            if (char === ')') parenDepth--;
            if (char === ',' && parenDepth === 0) {
                parts.push(currentPart.trim());
                currentPart = '';
            } else {
                currentPart += char;
            }
        }
        parts.push(currentPart.trim());
        rows.push(parts);
    }
    return rows;
}

function processTable(sql, tableName, currentOffset) {
    const blockRegex = new RegExp(`INSERT INTO ${tableName}\\s*\\(([^)]+)\\)\\s*VALUES([\\s\\S]+?);`, 'i');
    const match = blockRegex.exec(sql);
    if (!match) return '';

    let columns = match[1].split(',').map(c => c.trim());
    let rows = parseRows(match[2]);

    const isStores = tableName.toLowerCase() === 'stores';
    const isCustomers = tableName.toLowerCase() === 'customers';
    const isOrders = tableName.toLowerCase() === 'orders';
    const isPayments = tableName.toLowerCase() === 'payments';

    // 1. Handle ID
    if (!columns.map(c => c.toLowerCase()).includes('id')) {
        columns.unshift('id');
        rows = rows.map((row, i) => [currentOffset + i + 1, ...row]);
    }

    // 2. Handle Org ID
    const orgIndex = columns.findIndex(c => c.toLowerCase() === 'organization_id');
    if (orgIndex !== -1) {
        rows.forEach(row => row[orgIndex] = `'${ORG_ID}'`);
    }

    // 3. Handle Images & IDs in relations
    const dtIndex = columns.findIndex(c => c.toLowerCase() === 'created_at');

    if (isStores) {
        columns.splice(dtIndex, 0, 'store_logo', 'store_cover');
        rows.forEach(row => {
            const name = row[columns.findIndex(c => c.toLowerCase() === 'store_name')].replace(/'/g, '');
            const seed = name.replace(/\s+/g, '-').toLowerCase();
            row.splice(dtIndex, 0, `'https://picsum.photos/seed/${seed}-logo/200/200'`, `'https://picsum.photos/seed/${seed}-cover/800/400'`);
        });
    } else if (isCustomers) {
        columns.splice(dtIndex, 0, 'customer_photo');
        rows.forEach(row => {
            const name = row[columns.findIndex(c => c.toLowerCase() === 'customer_name')].replace(/'/g, '');
            const seed = name.replace(/\s+/g, '-').toLowerCase();
            row.splice(dtIndex, 0, `'https://picsum.photos/seed/${seed}/200/200'`);
        });
    } else if (isOrders) {
        const sIdIdx = columns.findIndex(c => c.toLowerCase() === 'store_id');
        const cIdIdx = columns.findIndex(c => c.toLowerCase() === 'customer_id');
        const numIdx = columns.findIndex(c => c.toLowerCase() === 'order_number');
        const nameIdx = columns.findIndex(c => c.toLowerCase() === 'order_name');

        columns.splice(dtIndex, 0, 'order_image');
        rows.forEach(row => {
            row[sIdIdx] = parseInt(row[sIdIdx]) + currentOffset;
            row[cIdIdx] = parseInt(row[cIdIdx]) + currentOffset;
            row[numIdx] = row[numIdx].replace(/'ORD-(\d+)'/, `'ORD-${ORG_ID.substring(0, 4)}-$1'`);

            const name = row[nameIdx].replace(/'/g, '');
            const seed = name.replace(/\s+/g, '-').toLowerCase();
            row.splice(dtIndex, 0, `'https://picsum.photos/seed/${seed}/400/400'`);
        });
    } else if (isPayments) {
        const cIdIdx = columns.findIndex(c => c.toLowerCase() === 'customer_id');
        columns.splice(dtIndex, 0, 'payment_proof');
        rows.forEach(row => {
            row[cIdIdx] = parseInt(row[cIdIdx]) + currentOffset;
            const seed = Math.random().toString(36).substring(7);
            row.splice(dtIndex, 0, `'https://picsum.photos/seed/${seed}/400/600'`);
        });
    }

    return `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES\n${rows.map(r => `(${r.join(', ')})`).join(',\n')};\n`;
}

let out = '';
out += processTable(seedSql, 'stores', OFFSET);
out += '\n';
out += processTable(seedSql, 'customers', OFFSET);
out += '\n';
out += processTable(seedOrdersSql, 'orders', OFFSET);
out += '\n';
out += processTable(seedOrdersSql, 'payments', OFFSET);

console.log(out);
