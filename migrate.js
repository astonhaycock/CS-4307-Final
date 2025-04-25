async function migrateSqliteToMysql(sqliteFile, mysqlPool) {
  // 1) open sqlite
  const sqliteDb = await open({
    filename: sqliteFile,
    driver: sqlite3.Database
  });

  // 2) get all non-system tables
  const tables = await sqliteDb.all(`
    SELECT name
      FROM sqlite_master
     WHERE type='table'
       AND name NOT LIKE 'sqlite_%';
  `);

  // helper to map SQLite affinity → MySQL type
  const mapType = t => {
    if (!t) return 'TEXT';
    t = t.toUpperCase();
    if (t.includes('INT')) return 'INT';
    if (t.includes('CHAR') || t.includes('CLOB') || t.includes('TEXT'))
      return 'TEXT';
    if (t.includes('BLOB')) return 'LONGBLOB';
    if (t.includes('REAL') || t.includes('FLOA') || t.includes('DOUB'))
      return 'DOUBLE';
    if (t.includes('NUM')) return 'DECIMAL(10,5)';
    return 'TEXT';
  };

  for (const { name: table } of tables) {
    console.log(`→ Migrating table: ${table}`);

    // 3) introspect only the *stored* columns (hidden=0 skips generated ones)
    const info = await sqliteDb.all(`PRAGMA table_xinfo('${table}')`);
    const cols = info.filter(col => col.hidden === 0);
    if (cols.length === 0) continue;

    // 4) drop & recreate so schema matches exactly
    await mysqlPool.query(`DROP TABLE IF EXISTS \`${table}\``);

    const colDefs = cols
      .map(c => `\`${c.name}\` ${mapType(c.type)}`)
      .join(', ');
    await mysqlPool.query(
      `CREATE TABLE \`${table}\` (${colDefs})`
    );

    // 5) pull every row from SQLite and insert into MySQL
    const rows = await sqliteDb.all(`SELECT ${cols.map(c => `'${c.name}'`).join(', ')} FROM \`${table}\``)
      .then(_ => sqliteDb.all(`SELECT * FROM \`${table}\``)); // simpler pull
    for (const row of rows) {
      const names = cols.map(c => c.name);
      const escCols = names.map(n => `\`${n}\``).join(', ');
      const placeholders = names.map(_ => '?').join(', ');
      const vals = names.map(n => row[n]);

      await mysqlPool.query(
        `INSERT INTO \`${table}\` (${escCols}) VALUES (${placeholders})`,
        vals
      );
    }
  }

  // 6) done
  await sqliteDb.close();
}


