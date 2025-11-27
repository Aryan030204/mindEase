"""
Quick test script for ML server
Run this to test if the ML server endpoints work correctly
"""
import requests
import json

ML_URL = "http://localhost:8000"

def test_ml_server():
    print("=" * 50)
    print("Testing ML Server")
    print("=" * 50)
    
    # Test root endpoint
    print("\n1. Testing root endpoint...")
    try:
        response = requests.get(f"{ML_URL}/", timeout=5)
        print(f"✓ Status: {response.status_code}")
        print(f"  Response: {json.dumps(response.json(), indent=2)}")
    except requests.exceptions.ConnectionError:
        print(f"✗ Connection refused. Is the ML server running on {ML_URL}?")
        print("  Start it with: cd ML && uvicorn app.main:app --reload")
        return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False
    
    # Test sentiment prediction
    print("\n2. Testing sentiment prediction...")
    try:
        response = requests.post(
            f"{ML_URL}/predict",
            json={"text": "I feel great today! Everything is going well."},
            timeout=5
        )
        print(f"✓ Status: {response.status_code}")
        print(f"  Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"✗ Error: {e}")
        return False
    
    # Test recommendation
    print("\n3. Testing activity recommendations...")
    try:
        response = requests.post(
            f"{ML_URL}/recommend",
            json={"moodScore": 4, "emotionTag": "sad"},
            timeout=5
        )
        print(f"✓ Status: {response.status_code}")
        result = response.json()
        print(f"  Response: {json.dumps(result, indent=2)}")
        
        # Validate suggestions
        valid_activities = ["meditation", "journaling", "music", "workout", "breathing", "walk"]
        suggestions = result.get("suggestions", [])
        invalid = [s for s in suggestions if s not in valid_activities]
        if invalid:
            print(f"  ⚠ Warning: Invalid activities found: {invalid}")
            print(f"  Valid activities: {valid_activities}")
        else:
            print("  ✓ All suggestions are valid")
    except Exception as e:
        print(f"✗ Error: {e}")
        return False
    
    # Test chat endpoint
    print("\n4. Testing chat endpoint...")
    try:
        response = requests.post(
            f"{ML_URL}/chat",
            json={"message": "I'm feeling anxious today"},
            timeout=5
        )
        print(f"✓ Status: {response.status_code}")
        result = response.json()
        print(f"  Response: {json.dumps(result, indent=2)}")
        if "reply" in result:
            print("  ✓ Chat reply generated successfully")
        else:
            print("  ⚠ Warning: No 'reply' field in response")
    except Exception as e:
        print(f"✗ Error: {e}")
        return False
    
    print("\n" + "=" * 50)
    print("All ML Server tests passed!")
    print("=" * 50)
    return True

if __name__ == "__main__":
    test_ml_server()

