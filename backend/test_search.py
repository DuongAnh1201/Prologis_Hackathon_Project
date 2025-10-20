#!/usr/bin/env python3
"""
Test script for the search functionality
"""

import asyncio
import json
from routes.search import ItemSearch
from pymongo import MongoClient
from dotenv import load_dotenv
import os

async def test_search_functionality():
    """Test the search functionality"""
    
    # Load environment variables
    load_dotenv()
    
    # Connect to MongoDB
    mongo_uri = os.getenv("MONGODB_URI")
    if not mongo_uri:
        print("❌ MONGODB_URI not set in .env file")
        return
    
    try:
        mongo_client = MongoClient(mongo_uri)
        database = mongo_client["prologis_hackathon"]
        print("✅ Connected to MongoDB successfully")
        
        # Create search engine
        search_engine = ItemSearch(database)
        
        # Test queries
        test_queries = [
            "brake cable",
            "pedal",
            "labor",
            "expensive items",
            "cheap parts"
        ]
        
        print("\n🔍 Testing Search Functionality")
        print("=" * 50)
        
        for query in test_queries:
            print(f"\n📝 Testing query: '{query}'")
            print("-" * 30)
            
            # Test semantic search
            try:
                semantic_results = await search_engine.semantic_search(query, limit=3)
                print(f"🧠 Semantic Search Results ({len(semantic_results)} found):")
                for i, result in enumerate(semantic_results, 1):
                    print(f"  {i}. {result['product_name']} (Score: {result['similarity_score']:.3f})")
                    print(f"     Price: ${result['product_data'].get('price', 'N/A')}")
                    print(f"     Quantity: {result['product_data'].get('quantity', 'N/A')}")
            except Exception as e:
                print(f"❌ Semantic search failed: {e}")
            
            # Test text search
            try:
                text_results = await search_engine.text_search(query, limit=3)
                print(f"📝 Text Search Results ({len(text_results)} found):")
                for i, result in enumerate(text_results, 1):
                    print(f"  {i}. {result['product_name']}")
                    print(f"     Price: ${result['product_data'].get('price', 'N/A')}")
                    print(f"     Quantity: {result['product_data'].get('quantity', 'N/A')}")
            except Exception as e:
                print(f"❌ Text search failed: {e}")
            
            # Test advanced search
            try:
                advanced_results = await search_engine.advanced_search(query, limit=3)
                print(f"🚀 Advanced Search Results ({len(advanced_results)} found):")
                for i, result in enumerate(advanced_results, 1):
                    print(f"  {i}. {result['product_name']}")
                    print(f"     Price: ${result['product_data'].get('price', 'N/A')}")
                    print(f"     Quantity: {result['product_data'].get('quantity', 'N/A')}")
                    if 'search_intent' in result:
                        print(f"     Intent: {result['search_intent'].get('intent_type', 'N/A')}")
            except Exception as e:
                print(f"❌ Advanced search failed: {e}")
        
        # Test getting item details
        print(f"\n📋 Testing Item Details")
        print("-" * 30)
        
        # Get a document ID to test with
        collection = database["chatbot"]
        sample_doc = collection.find_one({})
        
        if sample_doc:
            doc_id = str(sample_doc["_id"])
            print(f"🔍 Getting details for document ID: {doc_id}")
            
            try:
                item_details = await search_engine.get_item_details(doc_id)
                print(f"✅ Item details retrieved successfully")
                print(f"   Products found: {len(item_details.get('products', []))}")
                print(f"   User info: {item_details.get('user_info', {})}")
                
                # Show first product details
                if item_details.get('products'):
                    first_product = item_details['products'][0]
                    print(f"   First product: {first_product['product_name']}")
                    print(f"   Product data: {json.dumps(first_product['product_data'], indent=2)}")
                    
            except Exception as e:
                print(f"❌ Failed to get item details: {e}")
        else:
            print("⚠️ No documents found in database to test item details")
        
        print(f"\n✅ Search functionality test completed!")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
    finally:
        if 'mongo_client' in locals():
            mongo_client.close()
            print("🔌 MongoDB connection closed")

if __name__ == "__main__":
    asyncio.run(test_search_functionality())
