from fastapi import APIRouter, Request, HTTPException, Query
from typing import Dict, List, Optional
import os
import json
import numpy as np
from openai import OpenAI
from dotenv import load_dotenv
import traceback

# Initialize router
router = APIRouter()

class ItemSearch:
    def __init__(self, database):
        self.database = database
        load_dotenv()
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.collection = database["chatbot"] if database is not None else None

    async def search(self, query: str, limit: int = 5, min_score: float = 0.0) -> Dict:
        """
        Perform semantic + keyword search on documents stored by ImageDetection.
        
        Args:
            query: Search query string
            limit: Maximum number of results to return
            min_score: Minimum similarity score threshold (0.0 to 1.0)
        
        Returns:
            Dictionary with query, results, and metadata
        """
        if self.collection is None:
            raise HTTPException(status_code=500, detail="Database collection not available")

        try:
            # Step 1: Generate embedding for search query
            print(f"🔍 Generating embedding for query: {query}")
            embedding_response = self.client.embeddings.create(
                model="text-embedding-3-large",
                input=query
            )
            query_embedding = embedding_response.data[0].embedding
            print(f"✅ Generated embedding with dimension: {len(query_embedding)}")

            # Step 2: Fetch all documents with embeddings from MongoDB
            print("📥 Fetching documents from MongoDB...")
            documents = list(self.collection.find({"embedding": {"$exists": True}}))
            print(f"📊 Found {len(documents)} documents with embeddings")
            
            if not documents:
                return {
                    "query": query,
                    "results": [],
                    "total_found": 0,
                    "returned": 0,
                    "message": "No documents found in database"
                }

            # Step 3: Calculate similarity scores and rank results
            ranked_results = []
            query_vector = np.array(query_embedding)
            
            for idx, doc in enumerate(documents):
                try:
                    # Validate document structure
                    if not self._validate_document(doc):
                        print(f"⚠️  Document {idx} failed validation, skipping")
                        continue

                    doc_vector = np.array(doc["embedding"])
                    
                    # Calculate cosine similarity
                    similarity = self._cosine_similarity(doc_vector, query_vector)
                    
                    if similarity is None:
                        print(f"⚠️  Could not calculate similarity for document {idx}")
                        continue

                    # Process each product in the document
                    products = doc.get("structured_data", {}).get("products", {})
                    print(f"📦 Processing {len(products)} products from document {idx}")
                    
                    for product_name, product_data in products.items():
                        # Check for keyword match boost
                        keyword_match = self._matches_query(query, product_name, product_data)
                        
                        # Calculate final score (semantic + keyword boost)
                        final_score = similarity + (0.15 if keyword_match else 0)
                        
                        # Apply minimum score filter
                        if final_score < min_score:
                            continue
                        
                        # Build result entry
                        result_entry = {
                            "product_name": product_name,
                            "details": {
                                "pick_up_time": product_data.get("pick_up_time"),
                                "drop_off_location": product_data.get("drop_off_location"),
                                "drop_off_time": product_data.get("drop_off_time"),
                                "pick_up_location": product_data.get("pick_up_location"),
                                "quantity": product_data.get("quantity"),
                                "price": product_data.get("price")
                            },
                            "user_info": {
                                "user_id": doc.get("user_info", {}).get("user_id"),
                                "user_name": doc.get("user_info", {}).get("user_name"),
                                "pick_up_location": doc.get("user_info", {}).get("pick_up_location")
                            },
                            "similarity_score": round(final_score, 4),
                            "keyword_match": keyword_match,
                            "document_id": str(doc["_id"])
                        }
                        
                        ranked_results.append(result_entry)
                
                except Exception as doc_error:
                    print(f"⚠️  Error processing document {idx}: {str(doc_error)}")
                    continue

            # Step 4: Sort by similarity score (highest first)
            ranked_results.sort(key=lambda x: x["similarity_score"], reverse=True)
            print(f"✅ Found {len(ranked_results)} matching products")

            # Step 5: Return top results
            return {
                "query": query,
                "results": ranked_results[:limit],
                "total_found": len(ranked_results),
                "returned": min(limit, len(ranked_results))
            }

        except Exception as e:
            print(f"❌ Search error: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

    def _validate_document(self, doc: Dict) -> bool:
        """Validate that document has required structure."""
        try:
            if "embedding" not in doc:
                return False
            if not isinstance(doc["embedding"], list):
                return False
            if len(doc["embedding"]) == 0:
                return False
            if "structured_data" not in doc:
                return False
            if not isinstance(doc.get("structured_data"), dict):
                return False
            if "products" not in doc.get("structured_data", {}):
                return False
            if not isinstance(doc["structured_data"].get("products"), dict):
                return False
            return True
        except Exception as e:
            print(f"Validation error: {str(e)}")
            return False

    def _cosine_similarity(self, vec1: np.ndarray, vec2: np.ndarray) -> Optional[float]:
        """Calculate cosine similarity between two vectors."""
        try:
            # Ensure vectors are same dimension
            if len(vec1) != len(vec2):
                print(f"⚠️  Vector dimension mismatch: {len(vec1)} vs {len(vec2)}")
                return None
                
            norm1 = np.linalg.norm(vec1)
            norm2 = np.linalg.norm(vec2)
            
            if norm1 == 0 or norm2 == 0:
                return None
                
            similarity = float(np.dot(vec1, vec2) / (norm1 * norm2))
            return similarity
        except Exception as e:
            print(f"Cosine similarity error: {str(e)}")
            return None

    def _matches_query(self, query: str, product_name: str, product_data: Dict) -> bool:
        """
        Check if query keywords appear in product name or product fields.
        Case-insensitive matching.
        """
        try:
            query_lower = query.lower()
            
            # Check product name
            if query_lower in product_name.lower():
                return True
            
            # Check all product data fields
            for key, val in product_data.items():
                if val is None:
                    continue
                if isinstance(val, str) and query_lower in val.lower():
                    return True
                if isinstance(val, (int, float)) and query_lower in str(val):
                    return True
            
            return False
        except Exception as e:
            print(f"Keyword match error: {str(e)}")
            return False


# ---------------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------------

@router.get("/search")
async def search_endpoint(
    request: Request,
    q: str = Query(..., description="Search query"),
    limit: int = Query(5, ge=1, le=100, description="Max number of results (1-100)"),
    min_score: float = Query(0.0, ge=0.0, le=1.0, description="Minimum similarity score (0.0-1.0)")
):
    """
    Search through embedded OCR data using semantic similarity.
    
    - **q**: Search query (required)
    - **limit**: Maximum number of results to return (default: 5, max: 100)
    - **min_score**: Minimum similarity score threshold (default: 0.0)
    """
    try:
        print(f"\n🔍 Search request: q='{q}', limit={limit}, min_score={min_score}")
        
        # Check if database is available
        if not hasattr(request.app.state, 'db'):
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        db = request.app.state.db
        if db is None:
            raise HTTPException(status_code=500, detail="Database connection is None")
        
        # Initialize search engine and perform search
        search_engine = ItemSearch(db)
        results = await search_engine.search(q, limit, min_score)
        
        print(f"✅ Search completed: {results['returned']} results returned")
        
        return {
            "status": "success",
            "query": results["query"],
            "results": results["results"],
            "total_found": results["total_found"],
            "returned": results["returned"]
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Endpoint error: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/search/health")
async def health_check(request: Request):
    """Check if search service is operational."""
    try:
        if not hasattr(request.app.state, 'db'):
            return {
                "status": "unhealthy",
                "error": "Database not initialized in app state"
            }
        
        db = request.app.state.db
        if db is None:
            return {
                "status": "unhealthy",
                "error": "Database connection is None"
            }
            
        collection = db["chatbot"]
        doc_count = collection.count_documents({})
        embedded_count = collection.count_documents({"embedding": {"$exists": True}})
        
        return {
            "status": "healthy",
            "service": "search",
            "total_documents": doc_count,
            "documents_with_embeddings": embedded_count
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "traceback": traceback.format_exc()
        }