import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Get analysis history from database
    Args: event with httpMethod GET
    Returns: JSON array of analysis history
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Database not configured'})
        }
    
    conn = psycopg2.connect(db_url)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    query = """
        SELECT 
            id,
            text_content,
            confidence,
            verdict,
            sentiment,
            sentiment_score,
            ai_score,
            ai_insights,
            sources,
            created_at
        FROM t_p2227539_message_truth_analyz.analyses
        ORDER BY created_at DESC
        LIMIT 50
    """
    
    cur.execute(query)
    rows = cur.fetchall()
    
    results = []
    for row in rows:
        results.append({
            'id': str(row['id']),
            'text': row['text_content'][:100] + ('...' if len(row['text_content']) > 100 else ''),
            'confidence': row['confidence'],
            'verdict': row['verdict'],
            'sentiment': row['sentiment'],
            'sentimentScore': row['sentiment_score'],
            'aiScore': row['ai_score'],
            'aiInsights': row['ai_insights'],
            'sources': row['sources'],
            'timestamp': row['created_at'].isoformat()
        })
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'isBase64Encoded': False,
        'body': json.dumps(results, ensure_ascii=False)
    }
