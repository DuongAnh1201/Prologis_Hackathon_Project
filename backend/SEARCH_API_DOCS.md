# Search API Documentation

## Overview
The Search API provides powerful search capabilities for finding items in your database using multiple search methods including semantic search, text search, and AI-powered advanced search.

## Base URL
```
http://localhost:8000
```

## Search Endpoints

### 1. Semantic Search
**Endpoint:** `GET /search/semantic`

**Description:** Performs semantic search using OpenAI embeddings to find items based on meaning and context.

**Parameters:**
- `q` (required): Search query string
- `limit` (optional): Maximum number of results (default: 10)

**Example:**
```bash
curl "http://localhost:8000/search/semantic?q=brake%20cable&limit=5"
```

**Response:**
```json
{
  "status": "success",
  "query": "brake cable",
  "results": [
    {
      "product_name": "Front and rear brake cables",
      "product_data": {
        "user_id": "user123",
        "user_name": "John Doe",
        "pick_up_time": null,
        "category": "automotive",
        "drop_off_location": "Warehouse B",
        "drop_off_time": null,
        "pick_up_location": "Warehouse A",
        "quantity": 1,
        "price": 100.0
      },
      "user_info": {
        "user_id": "user123",
        "user_name": "John Doe",
        "pick_up_location": "Warehouse A"
      },
      "similarity_score": 0.95,
      "document_id": "507f1f77bcf86cd799439011",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ],
  "total_found": 1
}
```

### 2. Text Search
**Endpoint:** `GET /search/text`

**Description:** Performs text-based search across product names and data fields.

**Parameters:**
- `q` (required): Search query string
- `limit` (optional): Maximum number of results (default: 10)

**Example:**
```bash
curl "http://localhost:8000/search/text?q=pedal&limit=3"
```

**Response:**
```json
{
  "status": "success",
  "query": "pedal",
  "results": [
    {
      "product_name": "New set of pedal arms",
      "product_data": {
        "user_id": "user456",
        "user_name": "Jane Smith",
        "pick_up_time": null,
        "category": "bicycle",
        "drop_off_location": "Warehouse C",
        "drop_off_time": null,
        "pick_up_location": "Warehouse A",
        "quantity": 2,
        "price": 15.0
      },
      "user_info": {
        "user_id": "user456",
        "user_name": "Jane Smith",
        "pick_up_location": "Warehouse A"
      },
      "document_id": "507f1f77bcf86cd799439012",
      "timestamp": "2024-01-15T11:00:00Z"
    }
  ],
  "total_found": 1
}
```

### 3. Advanced Search
**Endpoint:** `GET /search/advanced`

**Description:** AI-powered search with query understanding and filtering capabilities.

**Parameters:**
- `q` (required): Search query string
- `limit` (optional): Maximum number of results (default: 10)
- `category` (optional): Filter by category
- `price_range` (optional): Price range filter (`under_100`, `over_100`)

**Example:**
```bash
curl "http://localhost:8000/search/advanced?q=expensive%20parts&price_range=over_100&limit=5"
```

**Response:**
```json
{
  "status": "success",
  "query": "expensive parts",
  "filters": {
    "price_range": "over_100"
  },
  "results": [
    {
      "product_name": "Front and rear brake cables",
      "product_data": {
        "user_id": "user123",
        "user_name": "John Doe",
        "pick_up_time": null,
        "category": "automotive",
        "drop_off_location": "Warehouse B",
        "drop_off_time": null,
        "pick_up_location": "Warehouse A",
        "quantity": 1,
        "price": 100.0
      },
      "user_info": {
        "user_id": "user123",
        "user_name": "John Doe",
        "pick_up_location": "Warehouse A"
      },
      "document_id": "507f1f77bcf86cd799439011",
      "timestamp": "2024-01-15T10:30:00Z",
      "search_intent": {
        "intent_type": "price_range",
        "keywords": ["expensive", "parts"],
        "filters": {"price_range": "over_100"},
        "search_type": "semantic"
      }
    }
  ],
  "total_found": 1
}
```

### 4. Get Item Details
**Endpoint:** `GET /search/item/{item_id}`

**Description:** Get detailed information about a specific item by document ID.

**Parameters:**
- `item_id` (required): MongoDB document ID

**Example:**
```bash
curl "http://localhost:8000/search/item/507f1f77bcf86cd799439011"
```

**Response:**
```json
{
  "status": "success",
  "item": {
    "document_id": "507f1f77bcf86cd799439011",
    "user_info": {
      "user_id": "user123",
      "user_name": "John Doe",
      "pick_up_location": "Warehouse A"
    },
    "products": [
      {
        "product_name": "Front and rear brake cables",
        "product_data": {
          "user_id": "user123",
          "user_name": "John Doe",
          "pick_up_time": null,
          "category": "automotive",
          "drop_off_location": "Warehouse B",
          "drop_off_time": null,
          "pick_up_location": "Warehouse A",
          "quantity": 1,
          "price": 100.0
        }
      }
    ],
    "ocr_text": "Original OCR text from the image...",
    "timestamp": "2024-01-15T10:30:00Z",
    "raw_data": {
      "products": {
        "Front and rear brake cables": {
          "user_id": "user123",
          "user_name": "John Doe",
          "pick_up_time": null,
          "category": "automotive",
          "drop_off_location": "Warehouse B",
          "drop_off_time": null,
          "pick_up_location": "Warehouse A",
          "quantity": 1,
          "price": 100.0
        }
      }
    }
  }
}
```

### 5. Search Statistics
**Endpoint:** `GET /search/stats`

**Description:** Get search statistics and database information.

**Example:**
```bash
curl "http://localhost:8000/search/stats"
```

**Response:**
```json
{
  "status": "success",
  "stats": {
    "total_documents": 25,
    "total_products": 75,
    "recent_activity": 5
  }
}
```

## Search Features

### 1. Semantic Search
- Uses OpenAI embeddings for meaning-based search
- Finds items even with different wording
- Returns similarity scores
- Best for conceptual searches

### 2. Text Search
- Fast text-based matching
- Searches product names and data fields
- Good for exact or partial matches
- No AI processing required

### 3. Advanced Search
- AI-powered query understanding
- Automatic intent detection
- Smart filtering capabilities
- Combines multiple search strategies

### 4. Search Intent Analysis
The advanced search uses OpenAI to analyze search intent:
- **intent_type**: `product_name`, `category`, `price_range`, `user`, `location`, `general`
- **keywords**: Important keywords extracted from query
- **filters**: Automatically detected filters
- **search_type**: `exact`, `partial`, `semantic`

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `404`: Item not found
- `500`: Server error

Error response format:
```json
{
  "detail": "Error message description"
}
```

## Usage Examples

### Frontend Integration (JavaScript)
```javascript
// Semantic search
const response = await fetch('/search/semantic?q=brake%20cable&limit=5');
const data = await response.json();

// Advanced search with filters
const response = await fetch('/search/advanced?q=expensive%20parts&price_range=over_100');
const data = await response.json();

// Get item details
const response = await fetch('/search/item/507f1f77bcf86cd799439011');
const data = await response.json();
```

### Python Integration
```python
import requests

# Semantic search
response = requests.get('http://localhost:8000/search/semantic', 
                       params={'q': 'brake cable', 'limit': 5})
data = response.json()

# Advanced search
response = requests.get('http://localhost:8000/search/advanced',
                       params={'q': 'expensive parts', 'price_range': 'over_100'})
data = response.json()
```

## Performance Tips

1. **Use appropriate search type:**
   - Semantic search for conceptual queries
   - Text search for exact matches
   - Advanced search for complex queries

2. **Limit results:** Always use the `limit` parameter to control response size

3. **Use filters:** Apply filters in advanced search to narrow results

4. **Cache results:** Consider caching frequent search results

## Requirements

- MongoDB database with processed image data
- OpenAI API key for semantic search and intent analysis
- Python packages: `numpy`, `openai`, `pymongo`, `fastapi`
