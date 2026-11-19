/**
 * PANTAS Row Level Security (RLS) Policy Simulation & Verification Test
 *
 * Verifies strict data isolation between two distinct user accounts:
 * - User A (ID: 11111111-1111-1111-1111-111111111111)
 * - User B (ID: 22222222-2222-2222-2222-222222222222)
 */

interface DatabaseRow {
  id: string;
  user_id: string;
  checkup_type: string;
  value_text: string;
}

class SimulatedSupabaseDatabase {
  private rows: DatabaseRow[] = [];

  // Simulate SQL: INSERT INTO checkups ... WITH CHECK (auth.uid() = user_id)
  insert(currentAuthUid: string, row: DatabaseRow): { success: boolean; error?: string } {
    if (row.user_id !== currentAuthUid) {
      return {
        success: false,
        error: 'RLS VIOLATION: new row violates row-level security policy for table "checkups" (INSERT WITH CHECK auth.uid() = user_id)',
      };
    }
    this.rows.push(row);
    return { success: true };
  }

  // Simulate SQL: SELECT * FROM checkups WHERE (auth.uid() = user_id)
  select(currentAuthUid: string): DatabaseRow[] {
    return this.rows.filter((r) => r.user_id === currentAuthUid);
  }

  // Simulate SQL: UPDATE checkups ... USING (auth.uid() = user_id)
  update(currentAuthUid: string, id: string, updates: Partial<DatabaseRow>): { updatedCount: number } {
    let count = 0;
    this.rows = this.rows.map((r) => {
      if (r.id === id && r.user_id === currentAuthUid) {
        count++;
        return { ...r, ...updates, user_id: currentAuthUid };
      }
      return r;
    });
    return { updatedCount: count };
  }

  // Simulate SQL: DELETE FROM checkups WHERE id = ... USING (auth.uid() = user_id)
  delete(currentAuthUid: string, id: string): { deletedCount: number } {
    const initialLen = this.rows.length;
    this.rows = this.rows.filter((r) => !(r.id === id && r.user_id === currentAuthUid));
    return { deletedCount: initialLen - this.rows.length };
  }

  // Total raw rows in physical Postgres table (for assertion verification)
  rawRowCount(): number {
    return this.rows.length;
  }
}

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${msg}`);
    throw new Error(msg);
  } else {
    console.log(`✅ PASS: ${msg}`);
  }
}

console.log('\n--- 1. Initializing Two Distinct User Sessions ---');
const USER_A_ID = '11111111-1111-1111-1111-111111111111';
const USER_B_ID = '22222222-2222-2222-2222-222222222222';
const db = new SimulatedSupabaseDatabase();

console.log('\n--- 2. Testing Insert Policy (WITH CHECK auth.uid() = user_id) ---');
// User A inserts their own checkup
const insertA = db.insert(USER_A_ID, {
  id: 'checkup-a-01',
  user_id: USER_A_ID,
  checkup_type: 'diabetes',
  value_text: 'GDP 105 mg/dL',
});
assert(insertA.success, 'User A berhasil menyimpan data pemeriksaan miliknya');

// User A attempts to forge user_id of User B (Spam / Hijack attempt)
const forgeInsert = db.insert(USER_A_ID, {
  id: 'checkup-malicious-01',
  user_id: USER_B_ID,
  checkup_type: 'hipertensi',
  value_text: 'TD 160/100',
});
assert(
  !forgeInsert.success && forgeInsert.error?.includes('RLS VIOLATION'),
  'Upaya User A memasukkan data atas nama User B langsung DITOLAK oleh RLS policy'
);

// User B inserts their own checkup
const insertB = db.insert(USER_B_ID, {
  id: 'checkup-b-01',
  user_id: USER_B_ID,
  checkup_type: 'hipertensi',
  value_text: 'TD 145/95 mmHg',
});
assert(insertB.success, 'User B berhasil menyimpan data pemeriksaan miliknya');

console.log('\n--- 3. Testing Select Policy (USING auth.uid() = user_id) ---');
// User A queries checkups
const rowsA = db.select(USER_A_ID);
assert(rowsA.length === 1 && rowsA[0].id === 'checkup-a-01', 'User A HANYA dapat membaca data milik User A');
assert(!rowsA.some((r) => r.user_id === USER_B_ID), 'Data User B sama sekali tidak bocor ke User A');

// User B queries checkups
const rowsB = db.select(USER_B_ID);
assert(rowsB.length === 1 && rowsB[0].id === 'checkup-b-01', 'User B HANYA dapat membaca data milik User B');
assert(!rowsB.some((r) => r.user_id === USER_A_ID), 'Data User A sama sekali tidak bocor ke User B');

console.log('\n--- 4. Testing Update Policy (USING auth.uid() = user_id) ---');
// User A tries to tamper with User B's record
const updateTamper = db.update(USER_A_ID, 'checkup-b-01', { value_text: 'TAMPERED VALUE' });
assert(
  updateTamper.updatedCount === 0,
  'User A TIDAK DAPAT mengubah data milik User B (0 rows affected)'
);

// User B updates their own record
const updateOwn = db.update(USER_B_ID, 'checkup-b-01', { value_text: 'TD 138/88 mmHg (Updated)' });
assert(updateOwn.updatedCount === 1, 'User B berhasil mengubah data miliknya sendiri');

console.log('\n--- 5. Testing Delete Policy (USING auth.uid() = user_id) ---');
// User A tries to delete User B's record
const deleteTamper = db.delete(USER_A_ID, 'checkup-b-01');
assert(deleteTamper.deletedCount === 0, 'User A TIDAK DAPAT menghapus data milik User B');
assert(db.select(USER_B_ID).length === 1, 'Data User B tetap utuh tidak terhapus');

// User B deletes their own record
const deleteOwn = db.delete(USER_B_ID, 'checkup-b-01');
assert(deleteOwn.deletedCount === 1, 'User B berhasil menghapus data miliknya sendiri');
assert(db.select(USER_B_ID).length === 0, 'Data User B terhapus setelah dihapus oleh pemiliknya');

// User A's data remains untouched
assert(db.select(USER_A_ID).length === 1, 'Data User A tetap aman dan utuh');

console.log('\n🎉 ALL ROW LEVEL SECURITY (RLS) MULTI-ACCOUNT ISOLATION TESTS PASSED!\n');

