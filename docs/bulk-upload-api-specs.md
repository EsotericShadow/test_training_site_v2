# Corrected API Specifications for Bulk Image Upload

Hello! I've reviewed the project's codebase to provide the accurate details needed for the bulk upload script. The initial plan had a few assumptions that don't match the live implementation. Here is the corrected information to guide the script's development.

---

### 1. Authentication: Session-Based, Not a Static Key

The most significant correction is the authentication method. The API does not use a simple Bearer token or a static API key. Instead, it uses a secure, session-based system that requires a login.

**Correct Authentication Flow:**

1.  **Login Request:** The script must first send a `POST` request to the admin login endpoint: `/api/adm_f7f8556683f1cdc65391d8d2_8e91/login`. This request should contain the admin's username and password.
2.  **Receive Cookie:** A successful login will return a session cookie named `admin_token` in the `Set-Cookie` header of the response.
3.  **Authenticated Requests:** All subsequent requests to the API (like file uploads) **must** include this `admin_token` cookie in their headers to be authenticated.

The script will need to use a session object (like `requests.Session` in Python) to automatically manage and send the cookie with each request after logging in.

---

### 2. API Endpoint for Uploads

The correct URL for uploading files is:

*   **URL:** `/api/adm_f7f8556683f1cdc65391d8d2_8e91/upload`
*   **Method:** `POST`

---

### 3. API Request Structure (Multipart Form Data)

The API expects a `multipart/form-data` request with the following field names. The script must use these exact names.

*   **`file`**: The image file being uploaded.
*   **`alt_text`**: The descriptive alt text for the image.
*   **`title`**: A title for the image (can be the filename or a more descriptive title).
*   **`description`**: A longer description for the image, if applicable.
*   **`tags`**: A comma-separated string of relevant tags (e.g., `"tag1,tag2,another tag"`).
*   **`category`**: The category the file belongs to. This is a required field.
*   **`is_featured`**: A boolean string (`"true"` or `"false"`) to mark the image as featured.

---

### 4. Category Mapping

The API accepts a specific list of categories. The script must map the local folder names to one of these allowed values.

**Allowed Category Values:**
`'general'`, `'team-photos'`, `'course-images'`, `'testimonials'`, `'company'`, `'other'`

**Confirmed Mapping:**

Your proposed mapping is mostly correct. Here is the confirmed mapping based on the allowed values:

*   `Bear`, `Brandi`, `Ed`, `Jack`, `Jessica`, `Lana` → **`team-photos`**
*   `Classroom`, `Fall Pro`, `Forklift`, `MEWP`, `NI-Forklift`, `Rigging`, `Skidsteer`, `Telehandler`, `Wheel Loader` → **`course-images`**
*   `Road & Rail` → **`company`**
*   `misc` → **`other`**

The script should be programmed with this logic to assign the correct category string for each upload.

---

### 5. Business & Brand Context

Based on a thorough review of the project's frontend components and content, here is the business and brand context required for generating appropriate metadata.

*   **What is the name of your company?**
    *   Karma Training

*   **What does your company do?**
    *   Karma Training provides premier safety training programs for industry and commerce in Northwestern BC. It offers Karma Industrial Safety Training (KIST) programs based on WorkSafeBC regulations, IVES operator certification for heavy equipment, custom course design, and safety consulting, including policy and procedure writing. The company emphasizes practical, hands-on training at the client's facilities using their own equipment.

*   **What is your brand's tone?**
    *   The brand's tone is **professional, experienced, and safety-focused**. The language used is direct and emphasizes expertise, with over 70 years of combined industrial and educational experience. It is also encouraging and motivational, reflected in the slogan: *"We believe the choices you make today will determine your tomorrow."* The overall voice should convey authority, trustworthiness, and a deep commitment to workplace safety.

---

This corrected information should be everything needed to build a robust and successful upload script. Let me know if you have any other questions!
