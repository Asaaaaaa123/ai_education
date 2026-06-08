# Child Test Feature Documentation

## Feature Overview

When parents fill out the assessment forms, if the child is 5 years or older, the system automatically adds a child attention test session.

## Test Content

### Schulte Attention Training
- **Test Type**: 5x5 number grid test
- **Test Rounds**: 3 rounds
- **Test Rules**: Click numbers 1-25 in order
- **Timing Rules**: Timer starts when clicking number 1, ends when clicking number 25
- **Evaluation Criteria**: Attention level assessment based on completion time
- **Features**: No red hints, child needs to find correct numbers independently

## Feature Flow

### 1. Parent Filling Phase
- Parents fill in child's basic information
- Including name, age, school type, etc.
- Fill in learning habits and behavioral performance

### 2. Age Check
- System checks child's age
- If age >= 5 years, enter child test
- If age < 5 years, submit assessment directly

### 3. Child Test Phase
- Display Schulte test instructions
- Child performs 3 rounds of attention tests
- Timer starts from first click
- After each round completion, immediately display round time and performance analysis
- Show test progress (completed rounds)
- Record each round completion time
- Calculate average performance
- No red hints, child finds numbers independently
- Provide personalized performance analysis and suggestions

### 4. Result Analysis
- After each round completion, display round time and performance analysis
- Provide personalized evaluation and suggestions based on time
- Compare performance changes across different rounds
- Finally display detailed results of three rounds
- Provide overall performance analysis and suggestions
- Integrate test results into assessment report
- Generate attention level rating
- Provide personalized training recommendations

## Comprehensive Assessment System

### Scoring Components (Total: 100 points)
- **Attention Score (40 points)**: Based on average completion time
- **Consistency Score (30 points)**: Based on time variation across rounds
- **Improvement Score (30 points)**: Based on performance improvement

### Assessment Levels
- **80-100 points**: Outstanding - Excellent focus, consistency, and learning ability
- **60-79 points**: Good - Solid focus skills with room for improvement
- **40-59 points**: Average - Needs more structured training and practice
- **0-39 points**: Needs Improvement - Professional guidance recommended

## Test Rating Standards

| Average Time | Rating | Description |
|-------------|--------|-------------|
| < 30 seconds | Excellent | Outstanding attention level |
| 30-45 seconds | Good | Good attention level |
| 45-60 seconds | Average | Average attention level |
| > 60 seconds | Needs Improvement | Attention needs strengthening |

## Technical Implementation

### Frontend Components
- `SchulteTest.js` - Schulte test component
- `AssessmentPage.js` - Modified assessment page
- `SchulteTest.css` - Test styles

### Backend API
- Modified `AssessmentRequest` model, added `childTestResults` field
- Added attention level assessment functions
- Added personalized recommendation generation functions
- Added comprehensive assessment calculation

### Data Flow
1. Frontend collects parent-filled information
2. Check age conditions
3. Display child test (if applicable)
4. Collect test results
5. Submit complete data to backend
6. Backend analyzes and generates report with comprehensive assessment

## Usage

### Development Testing
Visit `/test` path to test Schulte functionality separately

### Normal Usage
1. Visit homepage
2. Click "Get Personalized Support"
3. Fill out assessment forms
4. If child age >= 5, automatically enter child test
5. After completing test, view comprehensive assessment report

## File Structure

```
frontend/src/components/
├── AssessmentPage.js      # Modified assessment page
├── SchulteTest.js         # Schulte test component
├── SchulteTest.css        # Test styles
├── TestPage.js           # Test page
└── TestPage.css          # Test page styles

backend/
└── app.py                # Modified backend API
```

## Important Notes

1. **Age Restriction**: Only children 5 years and older will take the test
2. **Test Environment**: Recommended to conduct in quiet, distraction-free environment
3. **Parent Guidance**: Parents can guide from the side, but should not interfere with the test
4. **Result Interpretation**: Test results are for reference only, cannot replace professional assessment

## Future Extensions

1. **More Test Types**: Can add other attention tests
2. **Difficulty Adjustment**: Adjust test difficulty based on age
3. **History Records**: Save test history, track progress
4. **Gamification**: Add more interactive elements 