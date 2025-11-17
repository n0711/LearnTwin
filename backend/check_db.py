import sqlite3
import json

conn = sqlite3.connect('app.db')
cursor = conn.cursor()

# Get total count
total = cursor.execute('SELECT COUNT(*) FROM metrics').fetchone()[0]
print(f'Total records in database: {total}')
print('=' * 60)

# Get recent records
print('\nRecent records (most recent first):')
print('-' * 60)

records = cursor.execute('''
    SELECT id, class_id, student_id, stuck, got_it, pause, example,
           confidence, timestamp
    FROM metrics
    ORDER BY timestamp DESC
    LIMIT 10
''').fetchall()

if records:
    for row in records:
        print(f'\nID: {row[0]}')
        print(f'  Class ID: {row[1]}')
        print(f'  Student ID: {row[2]}')
        print(f'  Signals: Stuck={row[3]}, GotIt={row[4]}, Pause={row[5]}, Example={row[6]}')
        print(f'  Confidence: {row[7]}/10')
        print(f'  Time: {row[8]}')
else:
    print('No records found')

conn.close()
