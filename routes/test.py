import pymysql

conn = pymysql.connect(
    host="localhost",
    user="root",
    password="Nithish@2025",
    database="ipl_cricket_analytics"
)

print("Connected successfully!")
conn.close()