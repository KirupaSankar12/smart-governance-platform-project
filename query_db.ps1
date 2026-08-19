$env:PGPASSWORD="civic@12"
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d civicpulse_db -c "SELECT notification_id, recipient, recipient_role, title, event_type, created_at FROM notifications ORDER BY created_at DESC LIMIT 15;"
