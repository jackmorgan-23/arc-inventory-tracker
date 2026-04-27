from google.cloud import bigquery

def get_top_ips(project_id: str, limit: int = 10):
    client = bigquery.Client(project=project_id)
    dataset_id = f"{project_id}.cdn_access_logs"
    
    query = f"""
        SELECT
          httpRequest.remoteIp AS ip_address,
          COUNT(*) AS total_requests
        FROM
          `{dataset_id}.webrequests_*`
        WHERE
          _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)) AND FORMAT_DATE('%Y%m%d', CURRENT_DATE())
          AND httpRequest.remoteIp IS NOT NULL
        GROUP BY
          ip_address
        ORDER BY
          total_requests DESC
        LIMIT @limit
    """
    
    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("limit", "INT64", limit)
        ]
    )
    
    try:
        print(f"Analyzing Firebase traffic logs in {dataset_id}...\n")
        query_job = client.query(query, job_config=job_config)
        results = query_job.result()
        
        print("🌐 TOP IP ADDRESSES (Last 30 Days) 🌐")
        print("-" * 35)
        print(f"{'IP Address':<20} | {'Requests':<10}")
        print("-" * 35)
        
        for row in results:
            ip = row["ip_address"] if row["ip_address"] else "Unknown"
            print(f"{ip:<20} | {row['total_requests']:<10}")
            
    except Exception as e:
        print(f"Error executing query: {e}")

if __name__ == "__main__":
    MY_PROJECT_ID = "arc-492718" 
    get_top_ips(MY_PROJECT_ID)