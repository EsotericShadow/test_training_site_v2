# API Route Patterns

This document outlines the API routes available in the Karma Training Website, detailing their purpose, methods, and expected responses.

## 1. `/api/about-snippet`

**Purpose:** Retrieves data for the "About Us" section, including featured team members, company information, reasons to choose the company, and company values.

**Method:** `GET`

**Request:**
No parameters required.

**Response:**
A JSON object containing:
- `teamMembers`: An array of featured team members (up to 4), sorted by `display_order`.
- `companyInfo`: An object with general company details.
- `whyChooseUs`: An array of points explaining why customers should choose the company.
- `companyValues`: An array of the company's core values.

**Example (Conceptual):**
```json
{
  "teamMembers": [
    { "name": "John Doe", "role": "Instructor", "featured": true, "display_order": 1 },
    // ... more team members
  ],
  "companyInfo": {
    "company_name": "Karma Training",
    "description": "...",
    // ... more company info
  },
  "whyChooseUs": [
    { "point": "Expert instructors" },
    // ... more why choose us points
  ],
  "companyValues": [
    { "title": "Integrity", "description": "..." },
    // ... more company values
  ]
}
```

## 2. `/api/adm_f7f8556683f1cdc65391d8d2_8e91/auth`

**Purpose:** Checks the authentication status of the admin user and renews the session if necessary.

**Method:** `GET`

**Request:**
- Requires an `admin_token` cookie.

**Response:**
- **Success (200 OK):**
  ```json
  {
    "authenticated": true,
    "user": {
      "id": "<user_id>",
      "username": "<username>",
      "email": "<email>"
    }
  }
  ```
  - May set a new `admin_token` cookie if the session was renewed.
- **Failure (401 Unauthorized):**
  ```json
  {
    "error": "Not authenticated" // or "Invalid session"
  }
  ```
- **Error (500 Internal Server Error):**
  ```json
  {
    "error": "Failed to fetch about snippet data"
  }
  ```

## 3. `/api/adm_f7f8556683f1cdc65391d8d2_8e91/categories`

**Purpose:** Manages course categories.

### `GET`

**Purpose:** Retrieves all course categories.

**Request:**
No parameters required.

**Response:**
A JSON object containing:
- `categories`: An array of course category objects.

**Example (Conceptual):**
```json
{
  "categories": [
    { "id": 1, "name": "Foundation Safety", "description": "..." },
    // ... more categories
  ]
}
```

### `POST`

**Purpose:** Creates a new course category.

**Request:**
A JSON object in the request body with the following properties:
- `name` (string, required): The name of the new category.
- Other `CourseCategory` properties (optional).

**Response:**
- **Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "Category created successfully",
    "categoryId": "<new_category_id>"
  }
  ```
- **Failure (400 Bad Request):**
  ```json
  {
    "error": "Category name is required"
  }
  ```
- **Error (500 Internal Server Error):**
  ```json
  {
    "error": "Failed to create category"
  }
  ```

## 4. `/api/adm_f7f8556683f1cdc65391d8d2_8e91/company-info`

**Purpose:** Manages company information, values, and "why choose us" points.

### `GET`

**Purpose:** Retrieves all company-related information.

**Request:**
No parameters required.

**Response:**
A JSON object containing:
- `companyInfo`: An object with general company details.
- `companyValues`: An array of the company's core values.
- `whyChooseUs`: An array of points explaining why customers should choose the company.

**Example (Conceptual):**
```json
{
  "companyInfo": { "company_name": "Karma Training", "description": "..." },
  "companyValues": [{ "title": "Integrity", "description": "..." }],
  "whyChooseUs": [{ "point": "Expert instructors" }]
}
```

### `PUT`

**Purpose:** Updates company information, values, and "why choose us" points.

**Authentication:** Requires secure authentication (`withSecureAuth`).

**Request:**
A JSON object in the request body with the following properties:
- `companyInfo` (object, optional): Partial `CompanyInfo` object to update.
- `companyValues` (array, optional): Array of partial `CompanyValue` objects to update.
- `whyChooseUs` (array, optional): Array of partial `WhyChooseUs` objects to update.

**Response:**
- **Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "✓ Company information updated successfully"
  }
  ```
- **Failure (400 Bad Request):**
  ```json
  {
    "error": "Company Info: <validation_error_message>"
  }
  ```
- **Error (500 Internal Server Error):**
  ```json
  {
    "error": "Failed to update company information"
  }
  ```

## 5. `/api/adm_f7f8556683f1cdc65391d8d2_8e91/courses`

**Purpose:** Manages course information.

### `GET`

**Purpose:** Retrieves all courses with their associated features and category names for admin management.

**Request:**
No parameters required.

**Response:**
A JSON object containing:
- `courses`: An array of course objects, each including `features` (array of feature strings) and `category` (object with `name`).

**Example (Conceptual):**
```json
{
  "courses": [
    {
      "id": 1,
      "title": "KIST Orientation",
      "description": "...",
      "features": ["WorkSafeBC compliant", "Professional certification"],
      "category": { "name": "Foundation Safety" }
    }
  ]
}
```

### `POST`

**Purpose:** Creates a new course.

**Authentication:** Requires secure authentication (`withSecureAuth`) and a valid CSRF token.

**Request:**
A JSON object in the request body with the following properties:
- `features` (array of strings, optional): An array of course features.
- Other `Course` properties (partial, required fields for `Course` should be present).

**Response:**
- **Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "Course created successfully",
    "courseId": "<new_course_id>"
  }
  ```
- **Failure (400 Bad Request):**
  ```json
  {
    "error": "<validation_error_message>" // e.g., "Invalid category_id"
  }
  ```
- **Failure (401 Unauthorized):**
  ```json
  {
    "error": "Missing token" // or "Invalid session"
  }
  ```
- **Failure (403 Forbidden):**
  ```json
  {
    "error": "Invalid CSRF token"
  }
  ```
- **Error (500 Internal Server Error):**
  ```json
  {
    "error": "Failed to create course"
  }
  ```

### 5.1. `/api/adm_f7f8556683f1cdc65391d8d2_8e91/courses/[id]`

**Purpose:** Manages a specific course by its ID.

**Authentication:** All methods require secure authentication (`withSecureAuth`).

### `GET`

**Purpose:** Retrieves a specific course by its ID for editing.

**Request:**
- `id` (path parameter): The ID of the course to retrieve.

**Response:**
- **Success (200 OK):**
  ```json
  {
    "course": {
      "id": "<course_id>",
      "title": "<course_title>",
      "description": "<course_description>",
      "features": ["<feature1>", "<feature2>"]
    }
  }
  ```
- **Failure (400 Bad Request):**
  ```json
  {
    "error": "Invalid course ID"
  }
  ```
- **Failure (404 Not Found):**
  ```json
  {
    "error": "Course not found"
  }
  ```
- **Error (500 Internal Server Error):**
  ```json
  {
    "error": "Failed to fetch course"
  }
  ```

### `PUT`

**Purpose:** Updates a specific course by its ID.

**Request:**
- `id` (path parameter): The ID of the course to update.
- A JSON object in the request body with the following properties:
  - `features` (array of strings, optional): An array of updated course features.
  - Other `Course` properties (partial, required fields for `Course` should be present).

**Response:**
- **Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "Course updated successfully"
  }
  ```
- **Failure (400 Bad Request):**
  ```json
  {
    "error": "Invalid course ID" // or "Missing required fields: title, description, duration, audience"
  }
  ```
- **Failure (404 Not Found):**
  ```json
  {
    "error": "Course not found"
  }
  ```
- **Error (500 Internal Server Error):**
  ```json
  {
    "error": "Failed to update course"
  }
  ```

### `DELETE`

**Purpose:** Deletes a specific course by its ID.

**Request:**
- `id` (path parameter): The ID of the course to delete.

**Response:**
- **Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "Course deleted successfully"
  }
  ```
- **Failure (400 Bad Request):**
  ```json
  {
    "error": "Invalid course ID"
  }
  ```
- **Failure (404 Not Found):**
  ```json
  {
    "error": "Course not found"
  }
  ```
- **Error (500 Internal Server Error):**
  ```json
  {
    "error": "Failed to delete course"
  }
  ```

## 6. `/api/adm_f7f8556683f1cdc65391d8d2_8e91/csrf-token`

**Purpose:** Provides a CSRF token for authenticated admin requests.

**Method:** `GET`

**Request:**
No parameters required.

**Response:**
- **Success (200 OK):**
  ```json
  {
    "csrfToken": "<csrf_token_string>"
  }
  ```
- **Error (500 Internal Server Error):**
  ```json
  {
    "error": "Failed to generate CSRF token"
  }
  ```

## 7. `/api/adm_f7f8556683f1cdc65391d8d2_8e91/files`

**Purpose:** Manages file information.

### `GET`

**Purpose:** Retrieves all files.

**Authentication:** Requires an `admin_token` cookie and a valid session.

**Request:**
No parameters required.

**Response:**
- **Success (200 OK):**
  ```json
  {
    "files": [
      { "id": 1, "filename": "image.jpg", "category": "hero-backgrounds" },
      // ... more files
    ]
  }
  ```
- **Failure (401 Unauthorized):**
  ```json
  {
    "error": "Unauthorized: No session token" // or "Unauthorized: Invalid session"
  }
  ```
- **Error (500 Internal Server Error):**
  ```json
  {
    "error": "Failed to fetch files"
  }
  ```

### 7.1. `/api/adm_f7f8556683f1cdc65391d8d2_8e91/files/[id]`

**Purpose:** Manages a specific file by its ID.

**Authentication:** All methods require an `admin_token` cookie and a valid session.

### `GET`

**Purpose:** Retrieves a single file by its ID.

**Request:**
- `id` (path parameter): The ID of the file to retrieve.

**Response:**
- **Success (200 OK):**
  ```json
  {
    "file": { "id": 1, "filename": "image.jpg", "category": "hero-backgrounds" }
  }
  ```
- **Failure (400 Bad Request):**
  ```json
  {
    "error": "Invalid file ID"
  }
  ```
- **Failure (401 Unauthorized):**
  ```json
  {
    "error": "Unauthorized: No session token" // or "Unauthorized: Invalid session"
  }
  ```
- **Failure (404 Not Found):**
  ```json
  {
    "error": "File not found"
  }
  ```
- **Error (500 Internal Server Error):**
  ```json
  {
    "error": "Failed to fetch file"
  }
  ```

### `PUT`

**Purpose:** Updates a file's metadata by its ID.

**Request:**
- `id` (path parameter): The ID of the file to update.
- A JSON object in the request body with the file metadata to update.

**Response:**
- **Success (200 OK):**
  ```json
  {
    "file": { "id": 1, "filename": "updated.jpg", "category": "new-category" }
  }
  ```
- **Failure (400 Bad Request):**
  ```json
  {
    "error": "Invalid file ID" // or validation error message
  }
  ```
- **Failure (401 Unauthorized):**
  ```json
  {
    "error": "Unauthorized: No session token" // or "Unauthorized: Invalid session"
  }
  ```
- **Failure (404 Not Found):**
  ```json
  {
    "error": "File not found or failed to update"
  }
  ```
- **Error (500 Internal Server Error):**
  ```json
  {
    "error": "Failed to update file"
  }
  ```

### `DELETE`

**Purpose:** Deletes a file by its ID.

**Request:**
- `id` (path parameter): The ID of the file to delete.

**Response:**
- **Success (200 OK):**
  ```json
  {
    "message": "File deleted successfully"
  }
  ```
- **Failure (400 Bad Request):**
  ```json
  {
    "error": "Invalid file ID"
  }
  ```
- **Failure (401 Unauthorized):**
  ```json
  {
    "error": "Unauthorized: No session token" // or "Unauthorized: Invalid session"
  }
  ```
- **Failure (404 Not Found):**
  ```json
  {
    "error": "File not found"
  }
  ```
- **Error (500 Internal Server Error):**
  ```json
  {
    "error": "Failed to delete file"
  }
  ```

## 8. `/api/adm_f7f8556683f1cdc65391d8d2_8e91/footer`

**Purpose:** Manages footer content, statistics, quick links, certifications, and bottom badges.

### `GET`

**Purpose:** Retrieves all footer-related data.

**Request:**
- `admin` (query parameter, optional): Set to `true` to retrieve all quick links, certifications, and bottom badges (including inactive ones). Otherwise, only active ones are returned, and popular courses are included.

**Response:**
A JSON object containing:
- `footerContent`: An object with general footer details.
- `footerStats`: An array of footer statistics.
- `footerQuickLinks`: An array of quick links for the footer.
- `footerCertifications`: An array of footer certifications.
- `footerBottomBadges`: An array of footer bottom badges.
- `popularCourses` (only if `admin` is not `true`): An array of popular courses.

**Example (Conceptual):**
```json
{
  "footerContent": { "company_name": "Karma Training", "phone": "..." },
  "footerStats": [{ "number_text": "70+", "label": "Years Experience" }],
  "footerQuickLinks": [{ "title": "About Us", "url": "/about" }],
  "footerCertifications": [{ "title": "WorkSafeBC Compliant", "icon": "Award" }],
  "footerBottomBadges": [{ "title": "IVES Certified", "icon": "Users" }],
  "popularCourses": [{ "title": "KIST Orientation", "slug": "kist-orientation" }]
}
```

### `PUT`

**Purpose:** Updates various sections of the footer.

**Authentication:** Requires secure authentication (`withSecureAuth`).

**Request:**
A JSON object in the request body with one or more of the following properties:
- `footerContent` (object, optional): Partial `FooterContent` object to update.
- `footerStats` (array, optional): Array of partial `FooterStat` objects to update.
- `footerQuickLinks` (array, optional): Array of partial `FooterQuickLink` objects to update.
- `footerCertifications` (array, optional): Array of partial `FooterCertification` objects to update.
- `footerBottomBadges` (array, optional): Array of partial `FooterBottomBadge` objects to update.

**Response:**
- **Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "✓ Footer content updated successfully"
  }
  ```
- **Failure (400 Bad Request):**
  ```json
  {
    "error": "<validation_error_message>" // e.g., "Footer Content: Invalid email format"
  }
  ```
- **Error (500 Internal Server Error):**
  ```json
  {
    "error": "Failed to update footer content"
  }
  ```

## 9. `/api/adm_f7f8556683f1cdc65391d8d2_8e91/hero-section`

**Purpose:** Manages the hero section content, statistics, and features.

### `GET`

**Purpose:** Retrieves all hero section data.

**Rate Limiting:** Applies `public_api` rate limit.

**Request:**
No parameters required.

**Response:**
A JSON object containing:
- `heroSection`: An object with general hero section details.
- `heroStats`: An array of hero statistics.
- `heroFeatures`: An array of hero features.

**Example (Conceptual):**
```json
{
  "heroSection": { "slogan": "We believe...", "main_heading": "..." },
  "heroStats": [{ "number_text": "14+", "label": "Safety Courses" }],
  "heroFeatures": [{ "title": "WorkSafeBC Compliant", "description": "..." }]
}
```

### `PUT`

**Purpose:** Updates various sections of the hero section.

**Authentication:** Requires secure authentication (`withSecureAuth`).

**Rate Limiting:** Applies `admin_api` rate limit.

**Request:**
A JSON object in the request body with one or more of the following properties:
- `heroSection` (object, optional): Partial `HeroSection` object to update.
- `heroStats` (array, optional): Array of partial `HeroStat` objects to update.
- `heroFeatures` (array, optional): Array of partial `HeroFeature` objects to update.

**Response:**
- **Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "✓ Hero section updated successfully"
  }
  ```
- **Failure (429 Too Many Requests):**
  ```json
  {
    "error": "Too many requests"
  }
  ```
- **Error (500 Internal Server Error):**
  ```json
  {
    "error": "Failed to update hero section"
  }
  ```

## 10. `/api/adm_f7f8556683f1cdc65391d8d2_8e91/login`

**Purpose:** Authenticates an admin user and creates a session.

**Method:** `POST`

**Request:**
A JSON object in the request body with the following properties:
- `username` (string, required): The admin username.
- `password` (string, required): The admin password.

**Security Features:**
- Input validation for username and password.
- IP-based lockout for too many failed attempts from a single IP address.
- Account-based lockout for too many failed attempts on a specific username.
- Progressive rate limiting to prevent brute-force attacks.

**Response:**
- **Success (200 OK):**
  ```json
  {
    "success": true,
    "user": {
      "id": "<user_id>",
      "username": "<username>",
      "email": "<email>"
    }
  }
  ```
  - Sets an `admin_token` cookie for session management.
- **Failure (400 Bad Request):**
  ```json
  {
    "error": "Invalid input",
    "details": [
      { "path": "username", "message": "Username must be at least 3 characters" }
    ]
  }
  ```
- **Failure (401 Unauthorized):**
  ```json
  {
    "error": "Invalid credentials"
  }
  ```
- **Failure (429 Too Many Requests):**
  ```json
  {
    "error": "Too many failed login attempts from this IP address. Please try again later.",
    "lockoutUntil": "<timestamp>"
  }
  ```
  - Or:
  ```json
  {
    "error": "Account temporarily locked due to multiple failed attempts",
    "lockoutUntil": "<timestamp>",
    "retryAfter": "<seconds>"
  }
  ```
  - Or:
  ```json
  {
    "error": "Too many login attempts. Please try again later."
  }
  ```
- **Error (500 Internal Server Error):**
  ```json
  {
    "error": "Failed to create session. Please try again."
  }
  ```

## 11. `/api/adm_f7f8556683f1cdc65391d8d2_8e91/logout`

**Purpose:** Logs out an authenticated admin user by terminating their session.

**Method:** `POST`

**Request:**
- Requires an `admin_token` cookie.

**Response:**
- **Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```
  - Clears the `admin_token` cookie.
- **Error (500 Internal Server Error):**
  ```json
  {
    "error": "Logout failed"
  }
  ```
  - Attempts to clear the `admin_token` cookie even on error.

## 12. `/api/adm_f7f8556683f1cdc65391d8d2_8e91/sessions`

**Purpose:** Manages admin user sessions.

**Authentication:** All methods require secure authentication (`withSecureAuth`).

### `GET`

**Purpose:** Lists all active sessions for the current authenticated admin user.

**Request:**
No parameters required.

**Response:**
- **Success (200 OK):**
  ```json
  {
    "sessions": [
      {
        "id": "<session_id>",
        "createdAt": "<timestamp>",
        "expiresAt": "<timestamp>",
        "lastActivity": "<timestamp>",
        "ipAddress": "<ip_address>",
        "userAgent": "<user_agent_string>",
        "current": true // or false
      }
    ]
  }
  ```
- **Failure (401 Unauthorized):**
  ```json
  {
    "error": "Unauthorized"
  }
  ```
- **Error (500 Internal Server Error):**
  ```json
  {
    "error": "Failed to list sessions"
  }
  ```

### `DELETE`

**Purpose:** Terminates all active sessions for the current authenticated admin user, except for the current session.

**Request:**
No parameters required.

**Response:**
- **Success (200 OK):**
  ```json
  {
    "success": true,
    "terminatedCount": "<number_of_sessions_terminated>"
  }
  ```
- **Failure (401 Unauthorized):**
  ```json
  {
    "error": "Unauthorized"
  }
  ```
- **Error (500 Internal Server Error):**
  ```json
  {
    "error": "Failed to terminate other sessions"
  }
  ```

### 12.1. `/api/adm_f7f8556683f1cdc65391d8d2_8e91/sessions/[id]`

**Purpose:** Manages a specific admin user session by its ID.

**Authentication:** Requires secure authentication (`withSecureAuth`).

### `DELETE`

**Purpose:** Terminates a specific session by its ID.

**Request:**
- `id` (path parameter): The ID of the session to terminate.

**Response:**
- **Success (200 OK):**
  ```json
  {
    "success": true
  }
  ```
- **Failure (401 Unauthorized):**
  ```json
  {
    "error": "Unauthorized"
  }
  ```
- **Failure (403 Forbidden):**
  ```json
  {
    "error": "Unauthorized or session not found"
  }
  ```
- **Error (500 Internal Server Error):**
  ```json
  {
    "error": "Failed to terminate session"
  }
  ```

## 13. `/api/adm_f7f8556683f1cdc65391d8d2_8e91/team-members`

**Purpose:** Manages team member information.

**Authentication:** All methods require secure authentication (`withSecureAuth`).

### `GET`

**Purpose:** Retrieves all team members for admin management.

**Request:**
No parameters required.

**Response:**
A JSON object containing:
- `teamMembers`: An array of team member objects, with `specializations` ensured to be an array.

**Example (Conceptual):**
```json
{
  "teamMembers": [
    {
      "id": 1,
      "name": "John Doe",
      "role": "Instructor",
      "specializations": ["Fall Protection", "WHMIS"]
    }
  ]
}
```

### `POST`

**Purpose:** Creates a new team member.

**Authentication:** Requires secure authentication (`withSecureAuth`) and a valid CSRF token.

**Request:**
A JSON object in the request body with the following properties:
- `name` (string, required): The name of the team member.
- `role` (string, required): The role of the team member.
- `bio` (string, optional): A short biography.
- `photo_url` (string, optional): URL to the team member's photo.
- `experience_years` (number, optional): Years of experience.
- `specializations` (array of strings, optional): An array of specializations.
- `featured` (boolean, optional): Whether the team member is featured.
- `display_order` (number, optional): Display order of the team member.

**Response:**
- **Success (201 Created):**
  ```json
  {
    "success": true,
    "message": "Team member created successfully",
    "teamMember": { "id": "<new_team_member_id>", "name": "<name>", ... }
  }
  ```
- **Failure (400 Bad Request):**
  ```json
  {
    "error": "<validation_error_message>"
  }
  ```
- **Failure (401 Unauthorized):**
  ```json
  {
    "error": "Invalid session"
  }
  ```
- **Failure (403 Forbidden):**
  ```json
  {
    "error": "Invalid CSRF token"
  }
  ```
- **Error (500 Internal Server Error):**
  ```json
  {
    "error": "Failed to create team member"
  }
  ```

### 13.1. `/api/adm_f7f8556683f1cdc65391d8d2_8e91/team-members/[id]`

**Purpose:** Manages a specific team member by their ID.

**Authentication:** All methods require secure authentication (`withSecureAuth`).

### `GET`

**Purpose:** Retrieves a specific team member by their ID.

**Request:**
- `id` (path parameter): The ID of the team member to retrieve.

**Response:**
- **Success (200 OK):**
  ```json
  {
    "id": "<team_member_id>",
    "name": "<name>",
    "role": "<role>",
    "specializations": ["<specialization1>", "<specialization2>"]
  }
  ```
- **Failure (404 Not Found):**
  ```json
  {
    "error": "Team member not found"
  }
  ```
- **Error (500 Internal Server Error):**
  ```json
  {
    "error": "Failed to fetch team member"
  }
  ```

### `PUT`

**Purpose:** Updates a specific team member by their ID.

**Request:**
- `id` (path parameter): The ID of the team member to update.
- A JSON object in the request body with the team member data to update.

**Response:**
- **Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "Team member updated successfully"
  }
  ```
- **Failure (400 Bad Request):**
  ```json
  {
    "error": "<validation_error_message>"
  }
  ```
- **Failure (404 Not Found):**
  ```json
  {
    "error": "Team member not found"
  }
  ```
- **Error (500 Internal Server Error):**
  ```json
  {
    "error": "Failed to update team member"
  }
  ```

### `DELETE`

**Purpose:** Deletes a specific team member by their ID.

**Request:**
- `id` (path parameter): The ID of the team member to delete.

**Response:**
- **Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "Team member deleted successfully"
  }
  ```
- **Failure (404 Not Found):**
  ```json
  {
    "error": "Team member not found"
  }
  ```
- **Error (500 Internal Server Error):**
  ```json
  {
    "error": "Failed to delete team member"
  }
  ```

## 14. `/api/adm_f7f8556683f1cdc65391d8d2_8e91/upload`

**Purpose:** Handles file uploads to Vercel Blob storage and stores file metadata in the database.

**Authentication:** Both methods require an `admin_token` cookie and a valid session.

### `POST`

**Purpose:** Uploads a file and its associated metadata.

**Request:**
`multipart/form-data` request body containing:
- `file` (File, required): The file to upload (currently only images are allowed, max 15MB).
- `category` (string, optional): The category of the file (e.g., `general`, `team-photos`, `course-images`). Defaults to `general`.
- `alt_text` (string, optional): Alt text for the image.
- `title` (string, optional): Title for the file.
- `description` (string, optional): Description for the file.
- `tags` (string, optional): Comma-separated tags for the file.
- `is_featured` (boolean, optional): Whether the file is featured.

**Response:**
- **Success (200 OK):**
  ```json
  {
    "success": true,
    "file": {
      "id": "<file_id>",
      "filename": "<filename>",
      "original_name": "<original_name>",
      "file_size": "<file_size>",
      "mime_type": "<mime_type>",
      "blob_url": "<blob_url>",
      "category": "<category>",
      "alt_text": "<alt_text>",
      "title": "<title>",
      "description": "<description>",
      "tags": "<tags>",
      "is_featured": "<is_featured>"
    },
    "message": "File uploaded successfully"
  }
  ```
- **Failure (400 Bad Request):**
  ```json
  {
    "error": "Invalid file metadata: <validation_error_message>" // or "No file uploaded or invalid file", "Only image files are allowed", "File size must be less than 15MB", "Invalid category"
  }
  ```
- **Failure (401 Unauthorized):**
  ```json
  {
    "error": "Unauthorized: No session token" // or "Unauthorized: Invalid session"
  }
  ```
- **Error (500 Internal Server Error):**
  ```json
  {
    "error": "Failed to upload file to storage" // or "Failed to upload file"
  }
  ```

### `GET`

**Purpose:** Retrieves upload configuration details.

**Request:**
No parameters required.

**Response:**
- **Success (200 OK):**
  ```json
  {
    "maxFileSize": 15728640, // 15MB
    "allowedTypes": ["image/jpeg", "image/png", "image/webp", "image/gif"],
    "allowedCategories": ["team-photos", "course-images", "testimonials", "company", "other"]
  }
  ```
- **Failure (401 Unauthorized):**
  ```json
  {
    "error": "Unauthorized: No session token" // or "Unauthorized: Invalid session"
  }
  ```
- **Error (500 Internal Server Error):**
  ```json
  {
    "error": "Failed to get upload information"
  }
  ```
