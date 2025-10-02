CREATE TABLE IF NOT EXISTS t_p2227539_message_truth_analyz.analyses (
    id SERIAL PRIMARY KEY,
    text_content TEXT NOT NULL,
    confidence INTEGER NOT NULL,
    verdict VARCHAR(20) NOT NULL,
    sentiment VARCHAR(20) NOT NULL,
    sentiment_score INTEGER NOT NULL,
    ai_score INTEGER NOT NULL,
    ai_insights TEXT[] NOT NULL,
    sources TEXT[] NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analyses_created_at ON t_p2227539_message_truth_analyz.analyses(created_at DESC);
CREATE INDEX idx_analyses_verdict ON t_p2227539_message_truth_analyz.analyses(verdict);