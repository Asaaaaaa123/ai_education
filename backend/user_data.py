"""
User Data Management System
Manages children information and training progress for each user
"""
import os
import json
import logging
from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel

logger = logging.getLogger(__name__)

# Data storage paths
DATA_DIR = "data"
USER_DATA_FILE = os.path.join(DATA_DIR, "user_data.json")

# ==================== Data Models ====================

class Child(BaseModel):
    id: str
    name: str
    age: int
    gender: str
    birth_date: Dict
    created_at: str

class TestResult(BaseModel):
    id: str
    child_id: str
    test_type: str  # 'schulte', 'age_adaptive', 'comprehensive'
    results: Dict
    timestamp: str

class TrainingPlan(BaseModel):
    id: str
    child_id: str
    plan_name: str
    start_date: str
    end_date: str
    daily_tasks: List[Dict]
    completed_days: List[int]
    created_at: str

class UserData(BaseModel):
    user_id: str
    children: List[Child]
    test_results: List[TestResult]
    training_plans: List[TrainingPlan]
    last_updated: str

# ==================== Storage Functions ====================

def load_user_data() -> Dict:
    """Load all user data from file"""
    if os.path.exists(USER_DATA_FILE):
        try:
            with open(USER_DATA_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading user data: {e}")
            return {}
    return {}

def save_user_data(data: Dict):
    """Save all user data to file"""
    try:
        with open(USER_DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    except Exception as e:
        logger.error(f"Error saving user data: {e}")
        raise Exception("Failed to save user data")

def get_user_data(user_id: str) -> Dict:
    """Get data for a specific user"""
    all_data = load_user_data()
    if user_id not in all_data:
        # Initialize with empty data
        all_data[user_id] = {
            'user_id': user_id,
            'children': [],
            'test_results': [],
            'training_plans': [],
            'last_updated': datetime.now().isoformat()
        }
        save_user_data(all_data)
    
    return all_data[user_id]

def update_user_data(user_id: str, data: Dict):
    """Update data for a specific user"""
    all_data = load_user_data()
    all_data[user_id] = data
    all_data[user_id]['last_updated'] = datetime.now().isoformat()
    save_user_data(all_data)

# ==================== Child Management Functions ====================

def add_child(user_id: str, name: str, age: int, gender: str, birth_date: Dict) -> str:
    """Add a child to user's profile"""
    user_data = get_user_data(user_id)
    
    child = Child(
        id=f"child_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
        name=name,
        age=age,
        gender=gender,
        birth_date=birth_date,
        created_at=datetime.now().isoformat()
    )
    
    user_data['children'].append(child.dict())
    update_user_data(user_id, user_data)
    
    logger.info(f"Child added for user {user_id}: {name}")
    return child.id

def get_children(user_id: str) -> List[Dict]:
    """Get all children for a user"""
    user_data = get_user_data(user_id)
    return user_data.get('children', [])

def get_child(user_id: str, child_id: str) -> Optional[Dict]:
    """Get a specific child"""
    children = get_children(user_id)
    for child in children:
        if child['id'] == child_id:
            return child
    return None

# ==================== Test Result Management Functions ====================

def add_test_result(user_id: str, child_id: str, test_type: str, results: Dict) -> str:
    """Add a test result"""
    user_data = get_user_data(user_id)
    
    test_result = TestResult(
        id=f"test_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
        child_id=child_id,
        test_type=test_type,
        results=results,
        timestamp=datetime.now().isoformat()
    )
    
    user_data['test_results'].append(test_result.dict())
    update_user_data(user_id, user_data)
    
    logger.info(f"Test result added for child {child_id}: {test_type}")
    return test_result.id

def get_test_results(user_id: str, child_id: Optional[str] = None) -> List[Dict]:
    """Get test results for a user or specific child"""
    user_data = get_user_data(user_id)
    results = user_data.get('test_results', [])
    
    if child_id:
        results = [r for r in results if r['child_id'] == child_id]
    
    return results

# ==================== Training Plan Management Functions ====================

def create_training_plan(user_id: str, child_id: str, plan_name: str, 
                        start_date: str, end_date: str, daily_tasks: List[Dict]) -> str:
    """Create a new training plan"""
    user_data = get_user_data(user_id)
    
    plan = TrainingPlan(
        id=f"plan_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
        child_id=child_id,
        plan_name=plan_name,
        start_date=start_date,
        end_date=end_date,
        daily_tasks=daily_tasks,
        completed_days=[],
        created_at=datetime.now().isoformat()
    )
    
    user_data['training_plans'].append(plan.dict())
    update_user_data(user_id, user_data)
    
    logger.info(f"Training plan created for child {child_id}: {plan_name}")
    return plan.id

def get_training_plans(user_id: str, child_id: Optional[str] = None) -> List[Dict]:
    """Get training plans for a user or specific child"""
    user_data = get_user_data(user_id)
    plans = user_data.get('training_plans', [])
    
    if child_id:
        plans = [p for p in plans if p['child_id'] == child_id]
    
    return plans

def get_training_plan(user_id: str, plan_id: str) -> Optional[Dict]:
    """Get a specific training plan"""
    plans = get_training_plans(user_id)
    for plan in plans:
        if plan['id'] == plan_id:
            return plan
    return None

def update_daily_task(user_id: str, plan_id: str, day: int, status: str, notes: Optional[str] = None):
    """Update a daily task status"""
    plan = get_training_plan(user_id, plan_id)
    if not plan:
        raise Exception("Training plan not found")
    
    # Update task
    for task in plan['daily_tasks']:
        if task['day'] == day:
            task['status'] = status
            if notes:
                task['notes'] = notes
            if 'completed_at' not in task:
                task['completed_at'] = datetime.now().isoformat()
            break
    
    # Update completed days
    if day not in plan['completed_days']:
        plan['completed_days'].append(day)
    
    # Save updated plan
    user_data = get_user_data(user_id)
    for i, p in enumerate(user_data['training_plans']):
        if p['id'] == plan_id:
            user_data['training_plans'][i] = plan
            break
    
    update_user_data(user_id, user_data)
    logger.info(f"Task day {day} updated in plan {plan_id}")

def get_current_task(user_id: str, child_id: str) -> Optional[Dict]:
    """Get the current day's task for a child"""
    plans = get_training_plans(user_id, child_id)
    
    if not plans:
        return None
    
    # Get the most recent active plan
    active_plans = [p for p in plans if datetime.now().isoformat() <= p['end_date']]
    if not active_plans:
        return None
    
    plan = sorted(active_plans, key=lambda x: x['start_date'], reverse=True)[0]
    
    # Find current day
    start_date = datetime.fromisoformat(plan['start_date'])
    current_date = datetime.now()
    day = (current_date - start_date).days + 1
    
    # Find tasks for current day
    current_tasks = [t for t in plan['daily_tasks'] if t['day'] == day]
    
    return {
        'plan': plan,
        'day': day,
        'tasks': current_tasks,
        'completed': day in plan['completed_days']
    }










