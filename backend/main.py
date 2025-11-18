from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
from datetime import datetime

app = FastAPI(
    title="SpecialCare Connect API",
    description="Backend API for SpecialCare Connect - Comprehensive Support for Special Children & Families",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://frontend:80"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class AssessmentData(BaseModel):
    childName: str
    age: str
    schoolType: str
    schoolName: Optional[str] = ""
    grade: str
    subjects: dict
    learningHabits: List[str]
    classroomBehavior: List[str]
    socialBehavior: List[str]
    parentConcerns: Optional[str] = ""

class AssessmentResponse(BaseModel):
    id: str
    childName: str
    assessmentDate: datetime
    recommendations: dict
    carePlan: dict

# In-memory storage for demo (replace with database in production)
assessments = {}

@app.get("/")
async def root():
    return {
        "message": "Welcome to SpecialCare Connect API",
        "version": "1.0.0",
        "status": "healthy"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now()}

@app.post("/api/assessment", response_model=AssessmentResponse)
async def create_assessment(assessment: AssessmentData):
    """Create a new assessment and generate recommendations"""
    
    # Generate assessment ID
    assessment_id = f"assessment_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    # Analyze assessment data and generate recommendations
    recommendations = analyze_assessment_data(assessment)
    
    # Create care plan
    care_plan = generate_care_plan(assessment, recommendations)
    
    # Store assessment (in production, save to database)
    assessments[assessment_id] = {
        "id": assessment_id,
        "childName": assessment.childName,
        "assessmentDate": datetime.now(),
        "data": assessment.dict(),
        "recommendations": recommendations,
        "carePlan": care_plan
    }
    
    return AssessmentResponse(
        id=assessment_id,
        childName=assessment.childName,
        assessmentDate=datetime.now(),
        recommendations=recommendations,
        carePlan=care_plan
    )

@app.get("/api/assessment/{assessment_id}")
async def get_assessment(assessment_id: str):
    """Retrieve a specific assessment"""
    if assessment_id not in assessments:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    return assessments[assessment_id]

@app.get("/api/assessments")
async def list_assessments():
    """List all assessments"""
    return list(assessments.values())

def analyze_assessment_data(assessment: AssessmentData) -> dict:
    """Analyze assessment data and generate recommendations"""
    
    # Calculate overall scores
    subject_scores = assessment.subjects
    avg_subject_score = sum(subject_scores.values()) / len(subject_scores)
    
    # Analyze learning habits
    learning_challenges = len(assessment.learningHabits)
    behavior_challenges = len(assessment.classroomBehavior)
    social_challenges = len(assessment.socialBehavior)
    
    # Generate recommendations based on analysis
    recommendations = {
        "overallAssessment": {
            "academicScore": round(avg_subject_score * 20, 1),  # Convert to percentage
            "learningHabitsScore": max(0, 100 - learning_challenges * 15),
            "socialSkillsScore": max(0, 100 - social_challenges * 15),
            "behaviorScore": max(0, 100 - behavior_challenges * 15)
        },
        "mainProblems": generate_main_problems(assessment),
        "causeAnalysis": generate_cause_analysis(assessment),
        "recommendations": generate_recommendations(assessment),
        "priorityAreas": identify_priority_areas(assessment)
    }
    
    return recommendations

def generate_main_problems(assessment: AssessmentData) -> List[str]:
    """Identify main problems based on assessment data"""
    problems = []
    
    # Academic problems
    low_subjects = [subject for subject, score in assessment.subjects.items() if score <= 2]
    if low_subjects:
        problems.append(f"Struggles in {', '.join(low_subjects)} subjects")
    
    # Learning habit problems
    if 'attention' in assessment.learningHabits:
        problems.append("Attention and focus difficulties")
    if 'homework' in assessment.learningHabits:
        problems.append("Homework completion challenges")
    if 'organization' in assessment.learningHabits:
        problems.append("Organizational skill deficits")
    
    # Behavioral problems
    if 'disruptive' in assessment.classroomBehavior:
        problems.append("Classroom behavior management")
    if 'inattentive' in assessment.classroomBehavior:
        problems.append("Inattentive during lessons")
    
    # Social problems
    if 'friends' in assessment.socialBehavior:
        problems.append("Social interaction difficulties")
    if 'confidence' in assessment.socialBehavior:
        problems.append("Low self-confidence")
    
    return problems[:5]  # Return top 5 problems

def generate_cause_analysis(assessment: AssessmentData) -> dict:
    """Generate cause analysis for identified problems"""
    causes = {
        "academic": [],
        "behavioral": [],
        "social": [],
        "environmental": []
    }
    
    # Academic causes
    if 'memory' in assessment.learningHabits:
        causes["academic"].append("Memory and retention challenges")
    if 'motivation' in assessment.learningHabits:
        causes["academic"].append("Low intrinsic motivation")
    
    # Behavioral causes
    if 'attention' in assessment.learningHabits:
        causes["behavioral"].append("Attention regulation difficulties")
    if 'disruptive' in assessment.classroomBehavior:
        causes["behavioral"].append("Impulse control challenges")
    
    # Social causes
    if 'communication' in assessment.socialBehavior:
        causes["social"].append("Communication skill deficits")
    if 'anxiety' in assessment.socialBehavior:
        causes["social"].append("Social anxiety")
    
    # Environmental causes
    if assessment.schoolType == 'homeschool':
        causes["environmental"].append("Limited peer interaction opportunities")
    
    return causes

def generate_recommendations(assessment: AssessmentData) -> dict:
    """Generate personalized recommendations"""
    recommendations = {
        "learning": [],
        "behavioral": [],
        "social": [],
        "parental": []
    }
    
    # Learning recommendations
    if 'attention' in assessment.learningHabits:
        recommendations["learning"].append("Implement structured learning routines with frequent breaks")
        recommendations["learning"].append("Use visual aids and hands-on learning materials")
    if 'homework' in assessment.learningHabits:
        recommendations["learning"].append("Create a dedicated homework space with minimal distractions")
        recommendations["learning"].append("Break homework into smaller, manageable tasks")
    if 'organization' in assessment.learningHabits:
        recommendations["learning"].append("Use organizational tools like planners and checklists")
        recommendations["learning"].append("Establish consistent daily routines")
    
    # Behavioral recommendations
    if 'disruptive' in assessment.classroomBehavior:
        recommendations["behavioral"].append("Implement positive behavior reinforcement strategies")
        recommendations["behavioral"].append("Work with teachers to develop behavior management plans")
    if 'inattentive' in assessment.classroomBehavior:
        recommendations["behavioral"].append("Seat child near the front of the classroom")
        recommendations["behavioral"].append("Use visual and auditory cues to maintain attention")
    
    # Social recommendations
    if 'friends' in assessment.socialBehavior:
        recommendations["social"].append("Encourage participation in group activities and clubs")
        recommendations["social"].append("Practice social skills through role-playing exercises")
    if 'confidence' in assessment.socialBehavior:
        recommendations["social"].append("Celebrate small achievements and progress")
        recommendations["social"].append("Provide opportunities for success in areas of strength")
    
    # Parental recommendations
    recommendations["parental"].append("Maintain open communication with teachers and school staff")
    recommendations["parental"].append("Create a supportive home environment that reinforces learning")
    recommendations["parental"].append("Consider seeking professional support from specialists")
    
    return recommendations

def identify_priority_areas(assessment: AssessmentData) -> List[str]:
    """Identify priority areas for intervention"""
    priorities = []
    
    # Check academic performance
    low_subjects = [subject for subject, score in assessment.subjects.items() if score <= 2]
    if low_subjects:
        priorities.append("Academic Support")
    
    # Check learning habits
    if len(assessment.learningHabits) >= 3:
        priorities.append("Learning Skills Development")
    
    # Check behavioral issues
    if len(assessment.classroomBehavior) >= 2:
        priorities.append("Behavioral Intervention")
    
    # Check social skills
    if len(assessment.socialBehavior) >= 2:
        priorities.append("Social Skills Training")
    
    return priorities

def generate_care_plan(assessment: AssessmentData, recommendations: dict) -> dict:
    """Generate a comprehensive care plan"""
    
    care_plan = {
        "shortTerm": {
            "duration": "1-3 months",
            "goals": [
                "Establish consistent daily routines",
                "Improve communication with teachers",
                "Begin implementing recommended strategies"
            ],
            "activities": [
                "Daily schedule creation and implementation",
                "Weekly progress monitoring",
                "Regular parent-teacher communication"
            ]
        },
        "mediumTerm": {
            "duration": "3-6 months",
            "goals": [
                "Show measurable improvement in identified areas",
                "Develop stronger organizational skills",
                "Improve social interactions"
            ],
            "activities": [
                "Structured learning interventions",
                "Social skills group participation",
                "Regular assessment and adjustment of strategies"
            ]
        },
        "longTerm": {
            "duration": "6-12 months",
            "goals": [
                "Achieve grade-level academic performance",
                "Develop strong self-advocacy skills",
                "Build lasting friendships and social connections"
            ],
            "activities": [
                "Advanced academic support as needed",
                "Leadership and confidence-building activities",
                "Ongoing monitoring and support"
            ]
        },
        "professionalSupport": {
            "recommended": [],
            "frequency": "As needed",
            "coordination": "Regular team meetings and progress reviews"
        }
    }
    
    # Add professional support recommendations based on assessment
    if len(assessment.learningHabits) >= 3:
        care_plan["professionalSupport"]["recommended"].append("Learning Specialist")
    if len(assessment.classroomBehavior) >= 2:
        care_plan["professionalSupport"]["recommended"].append("Behavioral Therapist")
    if len(assessment.socialBehavior) >= 2:
        care_plan["professionalSupport"]["recommended"].append("Social Skills Coach")
    
    return care_plan

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080) 