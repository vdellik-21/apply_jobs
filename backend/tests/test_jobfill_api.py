"""
JobFill AI API Tests
Tests for: Health, Profile, Settings, Applications, Extension Download
"""
import pytest
import requests
import os
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://formzap-1.preview.emergentagent.com').rstrip('/')


class TestHealthEndpoint:
    """Health check endpoint tests"""
    
    def test_health_check_returns_200(self):
        """Test that health endpoint returns 200 OK"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        
    def test_health_check_response_structure(self):
        """Test health response has correct structure"""
        response = requests.get(f"{BASE_URL}/api/health")
        data = response.json()
        
        assert "status" in data
        assert data["status"] == "healthy"
        assert "service" in data
        assert data["service"] == "JobFill AI API"
        assert "version" in data


class TestProfileEndpoints:
    """Profile CRUD endpoint tests"""
    
    def test_get_profile_returns_200(self):
        """Test GET /api/profile returns 200"""
        response = requests.get(f"{BASE_URL}/api/profile")
        assert response.status_code == 200
        
    def test_get_profile_has_personal_info(self):
        """Test profile contains personal_info structure"""
        response = requests.get(f"{BASE_URL}/api/profile")
        data = response.json()
        
        assert "personal_info" in data
        personal_info = data["personal_info"]
        
        # Verify required fields exist
        assert "full_name" in personal_info
        assert "email" in personal_info
        assert "phone" in personal_info
        assert "linkedin" in personal_info
        assert "location" in personal_info
        
    def test_get_profile_has_work_experience(self):
        """Test profile contains work_experience array"""
        response = requests.get(f"{BASE_URL}/api/profile")
        data = response.json()
        
        assert "work_experience" in data
        assert isinstance(data["work_experience"], list)
        
        if len(data["work_experience"]) > 0:
            exp = data["work_experience"][0]
            assert "title" in exp
            assert "company" in exp
            
    def test_get_profile_has_education(self):
        """Test profile contains education array"""
        response = requests.get(f"{BASE_URL}/api/profile")
        data = response.json()
        
        assert "education" in data
        assert isinstance(data["education"], list)
        
    def test_get_profile_has_skills(self):
        """Test profile contains skills array"""
        response = requests.get(f"{BASE_URL}/api/profile")
        data = response.json()
        
        assert "skills" in data
        assert isinstance(data["skills"], list)
        
    def test_get_profile_has_certifications(self):
        """Test profile contains certifications array"""
        response = requests.get(f"{BASE_URL}/api/profile")
        data = response.json()
        
        assert "certifications" in data
        assert isinstance(data["certifications"], list)
        
    def test_profile_reset_returns_200(self):
        """Test POST /api/profile/reset returns 200"""
        response = requests.post(f"{BASE_URL}/api/profile/reset")
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("success") == True


class TestSettingsEndpoints:
    """Settings CRUD endpoint tests"""
    
    def test_get_settings_returns_200(self):
        """Test GET /api/settings returns 200"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        
    def test_get_settings_has_required_fields(self):
        """Test settings contains required configuration fields"""
        response = requests.get(f"{BASE_URL}/api/settings")
        data = response.json()
        
        # Core settings
        assert "auto_fill_enabled" in data
        assert "typing_speed" in data
        assert "random_delays" in data
        assert "save_applications" in data
        
    def test_get_settings_has_supported_platforms(self):
        """Test settings contains supported_platforms dict"""
        response = requests.get(f"{BASE_URL}/api/settings")
        data = response.json()
        
        assert "supported_platforms" in data
        platforms = data["supported_platforms"]
        
        # Check key platforms exist
        assert "linkedin" in platforms
        assert "indeed" in platforms
        assert "greenhouse" in platforms
        assert "lever" in platforms
        assert "workday" in platforms
        
    def test_get_settings_has_ai_provider(self):
        """Test settings contains AI provider configuration"""
        response = requests.get(f"{BASE_URL}/api/settings")
        data = response.json()
        
        assert "ai_provider" in data
        assert data["ai_provider"] in ["emergent", "openai", "claude"]


class TestApplicationsEndpoints:
    """Applications CRUD endpoint tests"""
    
    def test_get_applications_returns_200(self):
        """Test GET /api/applications returns 200"""
        response = requests.get(f"{BASE_URL}/api/applications")
        assert response.status_code == 200
        
    def test_get_applications_response_structure(self):
        """Test applications response has correct structure"""
        response = requests.get(f"{BASE_URL}/api/applications")
        data = response.json()
        
        assert "applications" in data
        assert "total" in data
        assert "limit" in data
        assert "skip" in data
        assert isinstance(data["applications"], list)
        
    def test_get_applications_with_limit(self):
        """Test applications endpoint respects limit parameter"""
        response = requests.get(f"{BASE_URL}/api/applications?limit=5")
        assert response.status_code == 200
        
        data = response.json()
        assert data["limit"] == 5
        
    def test_get_applications_stats_returns_200(self):
        """Test GET /api/applications/stats returns 200"""
        response = requests.get(f"{BASE_URL}/api/applications/stats")
        assert response.status_code == 200
        
    def test_get_applications_stats_structure(self):
        """Test applications stats has correct structure"""
        response = requests.get(f"{BASE_URL}/api/applications/stats")
        data = response.json()
        
        assert "total" in data
        assert "status_breakdown" in data
        assert "platform_breakdown" in data
        assert "weekly_applications" in data
        assert "today_applications" in data
        assert "success_rate" in data
        
    def test_get_applications_export_returns_200(self):
        """Test GET /api/applications/export returns 200"""
        response = requests.get(f"{BASE_URL}/api/applications/export")
        assert response.status_code == 200
        
    def test_get_applications_export_structure(self):
        """Test applications export has correct structure"""
        response = requests.get(f"{BASE_URL}/api/applications/export")
        data = response.json()
        
        assert "data" in data
        assert "count" in data
        assert isinstance(data["data"], list)
        
    def test_create_application_and_verify(self):
        """Test POST /api/applications creates application and verify with GET"""
        # Create test application
        test_app = {
            "company": "TEST_Company_" + datetime.now().strftime("%H%M%S"),
            "position": "TEST_Position",
            "platform": "LinkedIn",
            "status": "Applied",
            "applied_date": datetime.now().isoformat(),
            "job_url": "https://test.com/job",
            "auto_filled": True,
            "fields_filled": 10
        }
        
        create_response = requests.post(f"{BASE_URL}/api/applications", json=test_app)
        assert create_response.status_code == 200
        
        created_data = create_response.json()
        assert created_data.get("success") == True
        assert "application" in created_data
        
        # Verify the created application
        app = created_data["application"]
        assert app["company"] == test_app["company"]
        assert app["position"] == test_app["position"]
        assert app["platform"] == test_app["platform"]
        
        # Clean up - delete the test application
        if "_id" in app:
            delete_response = requests.delete(f"{BASE_URL}/api/applications/{app['_id']}")
            assert delete_response.status_code == 200


class TestExtensionDownload:
    """Extension download endpoint tests"""
    
    def test_extension_download_returns_file(self):
        """Test GET /api/extension/download returns a zip file"""
        response = requests.get(f"{BASE_URL}/api/extension/download")
        
        # Should return 200 with zip file
        assert response.status_code == 200
        
        # Check content type is zip
        content_type = response.headers.get('content-type', '')
        assert 'application/zip' in content_type or 'application/octet-stream' in content_type
        
    def test_extension_download_has_content(self):
        """Test extension download has actual content"""
        response = requests.get(f"{BASE_URL}/api/extension/download")
        
        # Should have content
        assert len(response.content) > 0
        
        # Zip files start with PK signature
        assert response.content[:2] == b'PK'


class TestAIFormAnalysis:
    """AI form analysis endpoint tests"""
    
    def test_analyze_form_returns_200(self):
        """Test POST /api/ai/analyze-form returns 200"""
        test_fields = {
            "fields": [
                {"field_name": "first_name", "field_type": "text", "label": "First Name"},
                {"field_name": "email", "field_type": "email", "label": "Email Address"},
                {"field_name": "phone", "field_type": "tel", "label": "Phone Number"}
            ],
            "job_title": "Marketing Analyst",
            "company": "Test Company"
        }
        
        response = requests.post(f"{BASE_URL}/api/ai/analyze-form", json=test_fields)
        assert response.status_code == 200
        
    def test_analyze_form_returns_mappings(self):
        """Test form analysis returns field mappings"""
        test_fields = {
            "fields": [
                {"field_name": "name", "field_type": "text", "label": "Full Name"},
                {"field_name": "email", "field_type": "email", "label": "Email"}
            ]
        }
        
        response = requests.post(f"{BASE_URL}/api/ai/analyze-form", json=test_fields)
        data = response.json()
        
        assert data.get("success") == True
        assert "field_mappings" in data
        assert isinstance(data["field_mappings"], list)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
