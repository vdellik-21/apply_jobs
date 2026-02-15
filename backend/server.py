from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import os
import json
from openai import OpenAI
from pymongo import MongoClient
from bson import ObjectId

app = FastAPI(title="JobFill AI API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB setup
MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME", "jobfill_db")
client = MongoClient(MONGO_URL)
db = client[DB_NAME]

# Collections
profiles_collection = db["profiles"]
applications_collection = db["applications"]
settings_collection = db["settings"]

# OpenAI client with Emergent key
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY", "sk-emergent-3Fe1c14F84b040fC67")
openai_client = OpenAI(
    api_key=EMERGENT_KEY,
    base_url="https://api.emergentagent.com/v1"
)

# Helper to serialize MongoDB documents
def serialize_doc(doc):
    if doc is None:
        return None
    doc["_id"] = str(doc["_id"])
    return doc

# Pydantic Models
class PersonalInfo(BaseModel):
    full_name: str = "Vineeth Dellikar"
    email: str = "vineeth.dellikar@gmail.com"
    phone: str = "+1 (309) 612-8928"
    linkedin: str = "linkedin.com/in/vineethdellikar"
    location: str = "Normal, IL, USA"
    # Address components for smart filling
    street_address: str = "906 Hovey Ave Apt 2"
    city: str = "Normal"
    state: str = "IL"
    state_full: str = "Illinois"
    zip_code: str = "61761"
    country: str = "United States"
    country_code: str = "US"
    website: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None

class WorkExperience(BaseModel):
    id: str
    title: str
    company: str
    location: Optional[str] = None
    start_date: str
    end_date: Optional[str] = None
    current: bool = False
    description: str
    achievements: List[str] = []

class Education(BaseModel):
    id: str
    degree: str
    field: str
    institution: str
    location: Optional[str] = None
    start_date: str
    end_date: Optional[str] = None
    gpa: Optional[str] = None
    achievements: List[str] = []

class Certification(BaseModel):
    id: str
    name: str
    issuer: str
    date: Optional[str] = None
    credential_id: Optional[str] = None

class Profile(BaseModel):
    personal_info: PersonalInfo
    summary: str
    work_experience: List[WorkExperience]
    education: List[Education]
    skills: List[str]
    certifications: List[Certification]
    languages: List[str] = ["English"]

class JobApplication(BaseModel):
    id: Optional[str] = None
    company: str
    position: str
    job_url: Optional[str] = None
    platform: str  # LinkedIn, Indeed, Greenhouse, etc.
    status: str = "Applied"  # Applied, In Progress, Interview, Rejected, Offer
    applied_date: str
    notes: Optional[str] = None
    auto_filled: bool = True
    fields_filled: int = 0

class Settings(BaseModel):
    auto_fill_enabled: bool = True
    supported_platforms: Dict[str, bool] = {
        "linkedin": True,
        "indeed": True,
        "greenhouse": True,
        "lever": True,
        "workday": True,
        "glassdoor": True,
        "ziprecruiter": True,
        "dice": True,
        "monster": True,
        "ycombinator": True,
        "wellfound": True,
        "startupsgallery": True,
        "ashbyhq": True,
        "simplyhired": True,
        "careerbuilder": True
    }
    typing_speed: str = "human"  # instant, fast, human, slow
    typing_delay_min: int = 50
    typing_delay_max: int = 150
    random_delays: bool = True
    auto_submit: bool = False
    save_applications: bool = True
    ai_matching: bool = True
    # AI Provider settings
    ai_provider: str = "emergent"  # emergent, openai, claude
    openai_api_key: Optional[str] = None
    claude_api_key: Optional[str] = None

class FormField(BaseModel):
    field_name: str
    field_type: str
    field_id: Optional[str] = None
    placeholder: Optional[str] = None
    label: Optional[str] = None
    options: Optional[List[str]] = None

class FormAnalysisRequest(BaseModel):
    fields: List[FormField]
    job_title: Optional[str] = None
    company: Optional[str] = None

# Default profile data (Vineeth's info)
DEFAULT_PROFILE = {
    "personal_info": {
        "full_name": "Vineeth Dellikar",
        "email": "vineeth.dellikar@gmail.com",
        "phone": "+1 (309) 612-8928",
        "linkedin": "linkedin.com/in/vineethdellikar",
        "location": "Normal, IL, USA",
        "website": None
    },
    "summary": "Results-driven Marketing Analytics professional with 4+ years of experience in digital marketing, performance marketing, and data-driven campaign optimization. Currently pursuing MS in Marketing Analytics (STEM) at Illinois State University with a 3.92 GPA. Proven track record of achieving 28-32x ROAS on high-ticket B2C campaigns and generating $336K-$384K monthly revenue.",
    "work_experience": [
        {
            "id": "exp1",
            "title": "Graduate Research Assistant",
            "company": "Illinois State University",
            "location": "Normal, IL",
            "start_date": "Aug 2025",
            "end_date": "May 2026",
            "current": True,
            "description": "Collaborate with faculty on research papers, build AI-powered apps for research tasks, synthesize journal insights, conduct literature reviews.",
            "achievements": ["100+ marketing research papers supported", "30% research prep time reduction", "6+ hours/week saved via AI tools"]
        },
        {
            "id": "exp2",
            "title": "Marketing Lead",
            "company": "Ardent Technologies",
            "location": "USA",
            "start_date": "May 2025",
            "end_date": "Dec 2025",
            "current": False,
            "description": "Managed paid advertising for US IVF clinics, executed Meta & Google Ads, designed lead funnels, built Tableau dashboards.",
            "achievements": ["35% improvement in monthly patient consultations", "28% reduction in Cost per Consultation", "40% increase in appointment booking rates"]
        },
        {
            "id": "exp3",
            "title": "Marketing Chairperson",
            "company": "M.A.S.S. RSO, Illinois State University",
            "location": "Normal, IL",
            "start_date": "Oct 2024",
            "end_date": "Dec 2025",
            "current": False,
            "description": "Led marketing campaigns, revamped branding and outreach, used A/B testing and analytics for student organization.",
            "achievements": ["60% YoY increase in student event participation", "25% boost in new member sign-ups"]
        },
        {
            "id": "exp4",
            "title": "Digital Marketing Manager",
            "company": "Marketing Dollar",
            "location": "India",
            "start_date": "Apr 2021",
            "end_date": "July 2024",
            "current": False,
            "description": "Freelance digital marketing consultancy for high-ticket IVF clients. Managed Facebook ad campaigns with $12,000/month budget.",
            "achievements": ["28x-32x ROAS achieved", "28-32 deals closed per week", "$336,000-$384,000 monthly revenue generated"]
        },
        {
            "id": "exp5",
            "title": "Digital Marketing Specialist",
            "company": "The Stars Wellness",
            "location": "India",
            "start_date": "Apr 2020",
            "end_date": "Apr 2021",
            "current": False,
            "description": "Executed market research with 10,000+ survey respondents, developed market segmentation and pricing strategies.",
            "achievements": ["125% ROI achieved", "1,000+ sign-ups in month 1", "$44,000 revenue in month 1"]
        }
    ],
    "education": [
        {
            "id": "edu1",
            "degree": "Master of Science",
            "field": "Marketing Analytics (STEM Designated)",
            "institution": "Illinois State University",
            "location": "Normal, IL",
            "start_date": "Aug 2024",
            "end_date": "May 2026",
            "gpa": "3.92/4.0",
            "achievements": ["STEM Designated Program", "Focus: Marketing analytics, predictive analytics, consumer behavior"]
        },
        {
            "id": "edu2",
            "degree": "Bachelor of Business Administration",
            "field": "Business Administration",
            "institution": "Osmania University",
            "location": "India",
            "start_date": "2019",
            "end_date": "2022",
            "gpa": "3.4/4.0 (8.5/10.0)",
            "achievements": ["Maintained GPA while freelancing full-time"]
        }
    ],
    "skills": [
        "Google Analytics", "GA4", "Google Ads", "Meta Ads", "Facebook Ads",
        "Tableau", "SQL", "Python", "R/RStudio", "Power BI",
        "HubSpot", "Salesforce CRM", "SEO", "Email Marketing",
        "A/B Testing", "Market Research", "Data Analysis",
        "Lead Generation", "Funnel Optimization", "ROI Analysis"
    ],
    "certifications": [
        {"id": "cert1", "name": "Google Analytics Certified", "issuer": "Google", "date": "2023"},
        {"id": "cert2", "name": "Google Analytics 4 (GA4) Certified", "issuer": "Google", "date": "2023"},
        {"id": "cert3", "name": "Google Ads Certified", "issuer": "Google", "date": "2023"},
        {"id": "cert4", "name": "Google Project Management Certified", "issuer": "Google", "date": "2023"},
        {"id": "cert5", "name": "Meta Blueprint Certified", "issuer": "Meta", "date": "2022"},
        {"id": "cert6", "name": "HubSpot Marketing Software Certified", "issuer": "HubSpot", "date": "2022"},
        {"id": "cert7", "name": "HubSpot Inbound Marketing Certified", "issuer": "HubSpot", "date": "2022"},
        {"id": "cert8", "name": "HubSpot Email Marketing Certified", "issuer": "HubSpot", "date": "2022"},
        {"id": "cert9", "name": "SQL for Data Science", "issuer": "UC Davis / Coursera", "date": "2023"},
        {"id": "cert10", "name": "Tableau Certified", "issuer": "Tableau", "date": "2023"},
        {"id": "cert11", "name": "LinkedIn Marketing Solutions Certified", "issuer": "LinkedIn", "date": "2023"},
        {"id": "cert12", "name": "Generative AI for Marketing", "issuer": "Coursera", "date": "2024"}
    ],
    "languages": ["English", "Hindi", "Telugu"]
}

DEFAULT_SETTINGS = {
    "auto_fill_enabled": True,
    "supported_platforms": {
        "linkedin": True,
        "indeed": True,
        "greenhouse": True,
        "lever": True,
        "workday": True,
        "glassdoor": True,
        "ziprecruiter": True
    },
    "typing_speed": "human",
    "typing_delay_min": 50,
    "typing_delay_max": 150,
    "random_delays": True,
    "auto_submit": False,
    "save_applications": True,
    "ai_matching": True
}

# API Routes

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "JobFill AI API", "version": "1.0.0"}

# Profile Routes
@app.get("/api/profile")
async def get_profile():
    """Get the user's profile data"""
    profile = profiles_collection.find_one({"type": "main_profile"})
    if profile:
        return serialize_doc(profile)
    # Return default profile if none exists
    return {"_id": "default", **DEFAULT_PROFILE}

@app.put("/api/profile")
async def update_profile(profile: Profile):
    """Update the user's profile"""
    profile_data = profile.model_dump()
    profile_data["type"] = "main_profile"
    profile_data["updated_at"] = datetime.utcnow().isoformat()
    
    result = profiles_collection.update_one(
        {"type": "main_profile"},
        {"$set": profile_data},
        upsert=True
    )
    return {"success": True, "message": "Profile updated successfully"}

@app.post("/api/profile/reset")
async def reset_profile():
    """Reset profile to default values"""
    profile_data = {**DEFAULT_PROFILE, "type": "main_profile", "updated_at": datetime.utcnow().isoformat()}
    profiles_collection.update_one(
        {"type": "main_profile"},
        {"$set": profile_data},
        upsert=True
    )
    return {"success": True, "message": "Profile reset to default"}

# Settings Routes
@app.get("/api/settings")
async def get_settings():
    """Get extension settings"""
    settings = settings_collection.find_one({"type": "main_settings"})
    if settings:
        return serialize_doc(settings)
    return {"_id": "default", **DEFAULT_SETTINGS}

@app.put("/api/settings")
async def update_settings(settings: Settings):
    """Update extension settings"""
    settings_data = settings.model_dump()
    settings_data["type"] = "main_settings"
    settings_data["updated_at"] = datetime.utcnow().isoformat()
    
    settings_collection.update_one(
        {"type": "main_settings"},
        {"$set": settings_data},
        upsert=True
    )
    return {"success": True, "message": "Settings updated successfully"}

# Applications Routes
@app.get("/api/applications")
async def get_applications(
    limit: int = 50,
    skip: int = 0,
    status: Optional[str] = None,
    platform: Optional[str] = None
):
    """Get job applications with optional filters"""
    query = {}
    if status:
        query["status"] = status
    if platform:
        query["platform"] = platform
    
    applications = list(
        applications_collection.find(query)
        .sort("applied_date", -1)
        .skip(skip)
        .limit(limit)
    )
    
    total = applications_collection.count_documents(query)
    
    return {
        "applications": [serialize_doc(app) for app in applications],
        "total": total,
        "limit": limit,
        "skip": skip
    }

@app.post("/api/applications")
async def create_application(application: JobApplication):
    """Log a new job application"""
    app_data = application.model_dump()
    app_data["created_at"] = datetime.utcnow().isoformat()
    
    result = applications_collection.insert_one(app_data)
    app_data["_id"] = str(result.inserted_id)
    
    return {"success": True, "application": app_data}

@app.put("/api/applications/{app_id}")
async def update_application(app_id: str, application: JobApplication):
    """Update a job application"""
    app_data = application.model_dump()
    app_data["updated_at"] = datetime.utcnow().isoformat()
    
    result = applications_collection.update_one(
        {"_id": ObjectId(app_id)},
        {"$set": app_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Application not found")
    
    return {"success": True, "message": "Application updated"}

@app.delete("/api/applications/{app_id}")
async def delete_application(app_id: str):
    """Delete a job application"""
    result = applications_collection.delete_one({"_id": ObjectId(app_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Application not found")
    
    return {"success": True, "message": "Application deleted"}

@app.get("/api/applications/stats")
async def get_application_stats():
    """Get application statistics"""
    total = applications_collection.count_documents({})
    
    # Status breakdown
    statuses = ["Applied", "In Progress", "Interview", "Rejected", "Offer"]
    status_counts = {}
    for status in statuses:
        status_counts[status] = applications_collection.count_documents({"status": status})
    
    # Platform breakdown
    platforms = ["LinkedIn", "Indeed", "Greenhouse", "Lever", "Workday", "Glassdoor", "ZipRecruiter", "Other"]
    platform_counts = {}
    for platform in platforms:
        platform_counts[platform] = applications_collection.count_documents({"platform": platform})
    
    # Weekly applications (last 7 days)
    week_ago = (datetime.utcnow() - timedelta(days=7)).isoformat()
    weekly = applications_collection.count_documents({"applied_date": {"$gte": week_ago}})
    
    # Today's applications
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    today_count = applications_collection.count_documents({"applied_date": {"$gte": today}})
    
    return {
        "total": total,
        "status_breakdown": status_counts,
        "platform_breakdown": platform_counts,
        "weekly_applications": weekly,
        "today_applications": today_count,
        "success_rate": round((status_counts.get("Interview", 0) + status_counts.get("Offer", 0)) / max(total, 1) * 100, 1)
    }

# AI Form Analysis
@app.post("/api/ai/analyze-form")
async def analyze_form(request: FormAnalysisRequest):
    """Use AI to analyze form fields and match with profile data"""
    
    # Get profile data
    profile = profiles_collection.find_one({"type": "main_profile"})
    if not profile:
        profile = DEFAULT_PROFILE
    
    # Build prompt for AI
    fields_description = "\n".join([
        f"- Field: {f.field_name}, Type: {f.field_type}, Label: {f.label or 'N/A'}, Placeholder: {f.placeholder or 'N/A'}"
        for f in request.fields
    ])
    
    prompt = f"""You are an expert at matching job application form fields with candidate profile data.

Candidate Profile:
- Name: {profile.get('personal_info', {}).get('full_name', 'N/A')}
- Email: {profile.get('personal_info', {}).get('email', 'N/A')}
- Phone: {profile.get('personal_info', {}).get('phone', 'N/A')}
- LinkedIn: {profile.get('personal_info', {}).get('linkedin', 'N/A')}
- Location: {profile.get('personal_info', {}).get('location', 'N/A')}
- Summary: {profile.get('summary', 'N/A')[:200]}...
- Skills: {', '.join(profile.get('skills', [])[:10])}
- Most Recent Job: {profile.get('work_experience', [{}])[0].get('title', 'N/A')} at {profile.get('work_experience', [{}])[0].get('company', 'N/A')}
- Education: {profile.get('education', [{}])[0].get('degree', 'N/A')} in {profile.get('education', [{}])[0].get('field', 'N/A')} from {profile.get('education', [{}])[0].get('institution', 'N/A')}

Job Application Form Fields:
{fields_description}

Job Title: {request.job_title or 'Not specified'}
Company: {request.company or 'Not specified'}

For each form field, return a JSON object with:
- field_name: the original field name
- suggested_value: the value to fill from the profile
- confidence: high/medium/low
- reasoning: brief explanation

Return ONLY a valid JSON array, no other text."""

    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that matches form fields with profile data. Always return valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=2000
        )
        
        result_text = response.choices[0].message.content.strip()
        
        # Try to parse JSON
        if result_text.startswith("```json"):
            result_text = result_text[7:]
        if result_text.startswith("```"):
            result_text = result_text[3:]
        if result_text.endswith("```"):
            result_text = result_text[:-3]
        
        field_mappings = json.loads(result_text)
        
        return {
            "success": True,
            "field_mappings": field_mappings,
            "profile_used": {
                "name": profile.get('personal_info', {}).get('full_name'),
                "email": profile.get('personal_info', {}).get('email')
            }
        }
        
    except Exception as e:
        # Fallback to rule-based matching
        return await fallback_form_analysis(request, profile)

async def fallback_form_analysis(request: FormAnalysisRequest, profile: dict):
    """Rule-based fallback for form field matching"""
    
    personal = profile.get('personal_info', {})
    mappings = []
    
    field_patterns = {
        'name': ['name', 'full_name', 'fullname', 'applicant_name', 'candidate_name'],
        'first_name': ['first_name', 'firstname', 'fname', 'given_name'],
        'last_name': ['last_name', 'lastname', 'lname', 'surname', 'family_name'],
        'email': ['email', 'e-mail', 'email_address', 'emailaddress'],
        'phone': ['phone', 'telephone', 'mobile', 'cell', 'phone_number'],
        'linkedin': ['linkedin', 'linkedin_url', 'linkedinurl', 'linkedin_profile'],
        'location': ['location', 'city', 'address', 'current_location'],
        'website': ['website', 'portfolio', 'personal_website', 'url']
    }
    
    profile_values = {
        'name': personal.get('full_name', ''),
        'first_name': personal.get('full_name', '').split()[0] if personal.get('full_name') else '',
        'last_name': ' '.join(personal.get('full_name', '').split()[1:]) if personal.get('full_name') else '',
        'email': personal.get('email', ''),
        'phone': personal.get('phone', ''),
        'linkedin': personal.get('linkedin', ''),
        'location': personal.get('location', ''),
        'website': personal.get('website', '')
    }
    
    for field in request.fields:
        field_lower = field.field_name.lower().replace('-', '_').replace(' ', '_')
        label_lower = (field.label or '').lower().replace('-', '_').replace(' ', '_')
        
        matched = False
        for key, patterns in field_patterns.items():
            if any(p in field_lower or p in label_lower for p in patterns):
                mappings.append({
                    "field_name": field.field_name,
                    "suggested_value": profile_values.get(key, ''),
                    "confidence": "high" if profile_values.get(key) else "low",
                    "reasoning": f"Matched pattern for {key}"
                })
                matched = True
                break
        
        if not matched:
            mappings.append({
                "field_name": field.field_name,
                "suggested_value": "",
                "confidence": "low",
                "reasoning": "No pattern match found"
            })
    
    return {
        "success": True,
        "field_mappings": mappings,
        "profile_used": {
            "name": personal.get('full_name'),
            "email": personal.get('email')
        },
        "fallback_used": True
    }

# Export endpoint for Excel data
@app.get("/api/applications/export")
async def export_applications():
    """Get all applications in a format suitable for Excel export"""
    applications = list(applications_collection.find().sort("applied_date", -1))
    
    export_data = []
    for app in applications:
        export_data.append({
            "Company": app.get("company", ""),
            "Position": app.get("position", ""),
            "Platform": app.get("platform", ""),
            "Status": app.get("status", ""),
            "Applied Date": app.get("applied_date", ""),
            "Job URL": app.get("job_url", ""),
            "Auto-Filled": "Yes" if app.get("auto_filled", False) else "No",
            "Fields Filled": app.get("fields_filled", 0),
            "Notes": app.get("notes", "")
        })
    
    return {"data": export_data, "count": len(export_data)}

# Download extension endpoint
@app.get("/api/extension/download")
async def download_extension():
    """Download the Chrome extension zip file"""
    zip_path = "/app/chrome-extension.zip"
    if os.path.exists(zip_path):
        return FileResponse(
            zip_path, 
            media_type="application/zip",
            filename="jobfill-chrome-extension.zip"
        )
    raise HTTPException(status_code=404, detail="Extension file not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
