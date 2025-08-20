# CSV Import Management Guide

## 1. Overview

The Family Learning Web platform supports bulk content import via CSV files to efficiently manage educational content, questions, vocabulary, and user data. This guide provides comprehensive instructions for administrators and content managers.

## 2. Supported Import Types

### 2.1 Question Bank Import

Import educational questions across all subjects and grade levels.

**File**: `questions-import-template.csv`

**Required Columns**:

- `id`: Unique identifier (optional, will be generated if empty)
- `type`: Question type (multiple_choice, true_false, matching, fill_blank)
- `subject`: Subject area (english, mathematics, hass, science)
- `yearLevel`: Target year level (3-12)
- `difficulty`: Difficulty level (easy, medium, hard, challenge)
- `title`: Question title/topic (optional)
- `instruction`: Instructions for the question
- `content`: Question content (JSON format for complex questions)
- `answerKey`: Correct answer(s) (JSON format)
- `explanation`: Answer explanation (optional)
- `estimatedTime`: Expected completion time in seconds
- `tags`: Comma-separated tags (optional)
- `curriculumCode`: ACARA curriculum descriptor code (optional)

**Example CSV Format**:

```csv
id,type,subject,yearLevel,difficulty,title,instruction,content,answerKey,explanation,estimatedTime,tags,curriculumCode
q001,multiple_choice,mathematics,3,easy,Basic Addition,"Choose the correct answer","What is 5 + 3?||A) 6||B) 7||C) 8||D) 9","{""correct"": [""C""]}","5 + 3 = 8. Count on your fingers to verify.",30,"addition,basic-math",ACMNA055
q002,true_false,english,3,medium,Australian Geography,"Decide if this statement is true or false","Australia is the smallest continent in the world","{""correct"": false}","Australia is the smallest continent, but Antarctica is smaller.",45,"geography,australia",ACHASSK066
```

### 2.2 Vocabulary Import

Import vocabulary lists for specific grade levels and topics.

**File**: `vocabulary-import-template.csv`

**Required Columns**:

- `word`: The vocabulary word
- `definition`: Word definition
- `yearLevel`: Target year level (3-12)
- `subject`: Subject area (primarily english, but can include others)
- `difficulty`: Difficulty level (easy, medium, hard)
- `pronunciation`: Phonetic pronunciation (optional)
- `partOfSpeech`: Grammar category (noun, verb, adjective, etc.)
- `exampleSentence`: Example usage (optional)
- `synonyms`: Comma-separated synonyms (optional)
- `antonyms`: Comma-separated antonyms (optional)
- `topic`: Topic or theme category (optional)
- `curriculumCode`: ACARA curriculum descriptor code (optional)

**Example CSV Format**:

```csv
word,definition,yearLevel,subject,difficulty,pronunciation,partOfSpeech,exampleSentence,synonyms,antonyms,topic,curriculumCode
kangaroo,A large Australian marsupial with strong hind legs for hopping,3,english,easy,/ˈkæŋɡəruː/,noun,"The kangaroo hopped across the field.",roo,,australian-animals,ACELA1459
enormous,Extremely large in size,4,english,medium,/ɪˈnɔːməs/,adjective,"The enormous elephant walked slowly.",huge,tiny,descriptive-words,ACELA1470
```

### 2.3 User Import

Bulk import student and parent accounts.

**File**: `users-import-template.csv`

**Required Columns**:

- `email`: User email address (must be unique)
- `displayName`: Full display name
- `role`: User role (student, parent, admin, teacher)
- `yearLevel`: For students only (3-12)
- `parentEmail`: For students - parent's email address
- `childEmails`: For parents - comma-separated child email addresses
- `dateOfBirth`: Birth date (YYYY-MM-DD format)
- `grade`: Current grade/class (optional)
- `school`: School name (optional)
- `isActive`: Account status (true/false)

**Example CSV Format**:

```csv
email,displayName,role,yearLevel,parentEmail,childEmails,dateOfBirth,grade,school,isActive
emma.student@school.edu.au,Emma Johnson,student,3,grace.parent@email.com,,2016-08-15,3A,Brisbane Primary School,true
grace.parent@email.com,Grace Johnson,parent,,,"emma.student@school.edu.au,michael.student@school.edu.au",1985-03-20,,Brisbane Primary School,true
michael.student@school.edu.au,Michael Johnson,student,6,grace.parent@email.com,,2013-11-10,6B,Brisbane Primary School,true
```

### 2.4 Assignment Template Import

Import pre-configured assignment templates.

**File**: `assignments-import-template.csv`

**Required Columns**:

- `title`: Assignment title
- `subject`: Subject area
- `yearLevel`: Target year level
- `description`: Assignment description
- `estimatedTime`: Expected completion time in minutes
- `questionIds`: Comma-separated question IDs to include
- `tags`: Comma-separated tags
- `isTemplate`: Mark as template (true) or regular assignment (false)
- `maxAttempts`: Maximum attempts allowed
- `passingScore`: Minimum score to pass (percentage)
- `unlockRules`: JSON format unlock rules (optional)

**Example CSV Format**:

```csv
title,subject,yearLevel,description,estimatedTime,questionIds,tags,isTemplate,maxAttempts,passingScore,unlockRules
Year 3 Math Review,mathematics,3,Basic arithmetic review covering addition and subtraction,20,"q001,q002,q003,q004,q005","math,review,year3",true,3,70,"{""minScore"": 70, ""unlockMinutes"": 15}"
Australian Animals Reading,english,3,Reading comprehension about native Australian animals,25,"e001,e002,e003,e004","reading,animals,australia",true,2,80,"{""minScore"": 80, ""unlockMinutes"": 20}"
```

## 3. CSV Import Process

### 3.1 Preparation Steps

1. **Download Template**
   - Navigate to Admin Panel → Content Management → Import Tools
   - Select the appropriate import type
   - Download the CSV template file
   - Review the template structure and example data

2. **Data Preparation**
   - Prepare your data in a spreadsheet application (Excel, Google Sheets, LibreOffice Calc)
   - Ensure all required columns are present
   - Validate data formats and constraints
   - Remove any extra columns not in the template

3. **Data Validation**
   - Check for duplicate IDs or email addresses
   - Verify date formats (YYYY-MM-DD)
   - Ensure all required fields have values
   - Validate foreign key relationships (e.g., parent-child links)

### 3.2 Import Steps

1. **Access Import Interface**

   ```
   Admin Panel → Content Management → Import Tools → [Select Type]
   ```

2. **Upload CSV File**
   - Click "Choose File" and select your prepared CSV
   - File size limit: 10MB
   - Supported formats: .csv, .txt
   - Encoding: UTF-8

3. **Preview and Validate**
   - Review the data preview showing first 10 rows
   - Check validation messages for any errors
   - Address any validation issues before proceeding

4. **Configure Import Options**
   - **Update Mode**: Create new records only vs. Update existing records
   - **Duplicate Handling**: Skip duplicates vs. Update vs. Error
   - **Validation Level**: Strict vs. Lenient
   - **Batch Size**: Number of records to process per batch

5. **Execute Import**
   - Click "Start Import" to begin processing
   - Monitor progress via the real-time progress bar
   - Review any error messages or warnings
   - Wait for completion confirmation

6. **Review Results**
   - Check the import summary report
   - Review any failed records and error details
   - Download error report if needed
   - Verify imported data in the system

### 3.3 Import Status Monitoring

The import process provides real-time feedback:

```
┌─────────────────────────────────────────────────┐
│ Import Progress: Questions Bank                 │
├─────────────────────────────────────────────────┤
│ File: questions-year3-math.csv                  │
│ Status: Processing... ████████████░░ 67%        │
│                                                 │
│ Records Processed: 134 / 200                    │
│ Successfully Created: 128                       │
│ Updated: 0                                      │
│ Skipped (Duplicates): 3                         │
│ Errors: 3                                       │
│                                                 │
│ Estimated Time Remaining: 2 minutes             │
└─────────────────────────────────────────────────┘
```

## 4. Data Validation Rules

### 4.1 Question Import Validation

- **ID Format**: Must be unique, alphanumeric with hyphens/underscores
- **Question Type**: Must be one of: multiple_choice, true_false, matching, fill_blank
- **Subject**: Must match predefined subjects: english, mathematics, hass, science
- **Year Level**: Must be integer between 3-12
- **Content Format**: Must be valid JSON for complex question types
- **Answer Key Format**: Must be valid JSON matching question type structure
- **Estimated Time**: Must be positive integer (seconds)

### 4.2 Vocabulary Import Validation

- **Word**: Must be non-empty string, no numbers or special characters
- **Definition**: Must be non-empty string, minimum 10 characters
- **Year Level**: Must be integer between 3-12
- **Part of Speech**: Must be valid grammar category
- **Pronunciation**: Must follow IPA format if provided
- **Example Sentence**: Must contain the vocabulary word

### 4.3 User Import Validation

- **Email Format**: Must be valid email address format
- **Email Uniqueness**: No duplicate email addresses allowed
- **Display Name**: Must be non-empty, minimum 2 characters
- **Role**: Must be one of: student, parent, admin, teacher
- **Date of Birth**: Must be valid date in YYYY-MM-DD format
- **Parent-Child Relationships**: Parent emails must exist for student records

### 4.4 Assignment Import Validation

- **Title Uniqueness**: Assignment titles must be unique within subject/year level
- **Question IDs**: All referenced question IDs must exist in the system
- **Time Estimates**: Must be positive integers
- **Passing Score**: Must be between 0-100
- **Unlock Rules**: Must be valid JSON format

## 5. Error Handling and Troubleshooting

### 5.1 Common Import Errors

#### Validation Errors

```
Error Type: INVALID_EMAIL_FORMAT
Row: 15
Column: email
Value: "not-an-email"
Message: Email address format is invalid
Resolution: Correct email format (user@domain.com)
```

#### Data Type Errors

```
Error Type: INVALID_YEAR_LEVEL
Row: 23
Column: yearLevel
Value: "Year 3"
Message: Year level must be a number between 3-12
Resolution: Change to numeric value (3)
```

#### Foreign Key Errors

```
Error Type: PARENT_NOT_FOUND
Row: 8
Column: parentEmail
Value: "missing@parent.com"
Message: Referenced parent email does not exist
Resolution: Ensure parent record exists or import parents first
```

### 5.2 Troubleshooting Guide

#### High Error Rate

- **Cause**: Template format mismatch
- **Solution**: Re-download template and verify column headers match exactly
- **Prevention**: Always use the latest template from the system

#### Import Timeout

- **Cause**: File too large or complex validation
- **Solution**: Split large files into smaller batches (< 1000 records)
- **Prevention**: Use batch processing for large datasets

#### Encoding Issues

- **Cause**: Non-UTF-8 file encoding
- **Solution**: Save CSV with UTF-8 encoding in your spreadsheet software
- **Prevention**: Always specify UTF-8 when saving CSV files

#### Memory Errors

- **Cause**: Large file or complex JSON data
- **Solution**: Reduce batch size in import settings
- **Prevention**: Optimize JSON content structure

### 5.3 Recovery Procedures

#### Partial Import Failure

1. Download the error report
2. Fix the identified issues in your source data
3. Filter out successfully imported records
4. Re-import the corrected subset

#### Complete Import Failure

1. Check system logs for detailed error information
2. Verify file format and template compliance
3. Test with a small subset of data first
4. Contact system administrator if issues persist

## 6. Best Practices

### 6.1 Data Preparation

- **Start Small**: Test with 5-10 records before importing large datasets
- **Backup First**: Export existing data before major imports
- **Clean Data**: Remove duplicates and validate formats in your source system
- **Use Templates**: Always start with the provided CSV templates
- **Incremental Imports**: Import in logical batches rather than all at once

### 6.2 Quality Assurance

- **Review Sample**: Always preview your data before final import
- **Cross-Reference**: Verify relationships between imported data types
- **Test Functionality**: Verify imported content works correctly in the system
- **User Acceptance**: Have end-users test imported content before going live

### 6.3 Scheduling and Planning

- **Off-Peak Hours**: Perform large imports during low-usage periods
- **Maintenance Windows**: Schedule imports during planned maintenance
- **Communication**: Notify users of any system downtime during imports
- **Rollback Plan**: Have a plan to revert changes if issues arise

## 7. Advanced Features

### 7.1 Bulk Update Operations

Update existing records by including their ID in the import file:

```csv
id,title,subject,yearLevel,difficulty
q001,Updated Question Title,mathematics,3,medium
```

### 7.2 Conditional Imports

Use import rules to conditionally process records:

```json
{
  "importRules": {
    "skipIfExists": true,
    "updateOnDuplicate": false,
    "requiredFields": ["title", "content", "answerKey"],
    "validationLevel": "strict"
  }
}
```

### 7.3 Automated Imports

Set up scheduled imports for regular content updates:

1. Upload CSV to designated folder
2. Configure import schedule (daily, weekly, monthly)
3. Set notification preferences for success/failure
4. Monitor via automated reports

### 7.4 API-Based Imports

For developers, programmatic imports are available via REST API:

```javascript
// Example API import
const formData = new FormData()
formData.append('file', csvFile)
formData.append('type', 'questions')
formData.append(
  'options',
  JSON.stringify({
    updateMode: 'create',
    batchSize: 100,
  })
)

const response = await fetch('/api/admin/import', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
})
```

## 8. Security and Compliance

### 8.1 Data Security

- All uploads are scanned for malware
- CSV content is validated and sanitized
- Import logs are audited for compliance
- Access is restricted to authorized administrators

### 8.2 Privacy Considerations

- Personal data is handled according to Australian Privacy Act
- Student data requires parental consent
- Data retention policies apply to imported content
- Audit trails maintain record of all imports

### 8.3 Backup and Recovery

- Automatic backups before major imports
- Point-in-time recovery capabilities
- Import rollback functionality
- Data archiving for compliance requirements

## 9. Monitoring and Reporting

### 9.1 Import Analytics

Track import performance and success rates:

- Import success rate by type and date
- Average processing time per record type
- Most common validation errors
- User activity and import frequency

### 9.2 Content Analytics

Monitor imported content usage:

- Question usage statistics
- Vocabulary learning progress
- Assignment completion rates
- Content quality feedback

### 9.3 System Health

Monitor system impact of imports:

- Database performance during imports
- Memory and CPU usage patterns
- Error rates and recovery times
- User experience impact assessment

## 10. Support and Resources

### 10.1 Documentation

- [Question DSL Reference](./dsl.md)
- [User Management Guide](./user-management.md)
- [Curriculum Alignment Guide](./curriculum.md)
- [API Documentation](./api/)

### 10.2 Training Resources

- Import tool video tutorials
- CSV template workshops
- Best practices webinars
- Troubleshooting guides

### 10.3 Support Channels

- **Technical Support**: support@familylearningweb.com.au
- **Training Requests**: training@familylearningweb.com.au
- **Emergency Support**: emergency@familylearningweb.com.au
- **Documentation Feedback**: docs@familylearningweb.com.au

---

**Last Updated**: November 2024  
**Version**: 1.0  
**Next Review**: February 2025
