import json
import os
from typing import Dict, Any
from openai import OpenAI

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Analyze text veracity using OpenAI GPT-4
    Args: event with httpMethod, body containing text to analyze
    Returns: JSON with confidence, verdict, sentiment, AI insights
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body_raw = event.get('body', '{}')
    if not body_raw or body_raw.strip() == '':
        body_raw = '{}'
    
    body_data = json.loads(body_raw)
    text = body_data.get('text', '')
    
    if not text.strip():
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Text is required'})
        }
    
    api_key = os.environ.get('OPENAI_API_KEY')
    if not api_key:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'OpenAI API key not configured'})
        }
    
    client = OpenAI(api_key=api_key)
    
    prompt = f"""Проанализируй следующий текст и предоставь детальную оценку:

Текст: "{text}"

Верни JSON со следующими полями:
1. confidence (0-100): уровень достоверности информации
2. verdict: "verified" (высокая достоверность), "unverified" (средняя), или "warning" (низкая)
3. sentiment: "positive", "neutral", или "negative"
4. sentimentScore (-100 до 100): числовая оценка тональности
5. aiScore (0-100): общая AI-оценка качества текста
6. aiInsights: массив из 3-5 ключевых наблюдений на русском языке
7. sources: массив из 2-4 рекомендуемых источников для проверки

Анализируй:
- Фактическую точность
- Эмоциональную окраску
- Структуру и логику
- Возможные предвзятости

Верни только JSON, без дополнительного текста."""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "Ты эксперт по анализу достоверности текстов. Отвечай только в формате JSON."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=800
    )
    
    ai_response = response.choices[0].message.content.strip()
    
    if ai_response.startswith('```json'):
        ai_response = ai_response[7:]
    if ai_response.endswith('```'):
        ai_response = ai_response[:-3]
    ai_response = ai_response.strip()
    
    result = json.loads(ai_response)
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'isBase64Encoded': False,
        'body': json.dumps(result, ensure_ascii=False)
    }