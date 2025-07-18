// types/database.ts

export interface CompanyInfo {
    id: number;
    company_name: string;
    slogan: string;
    description: string;
    mission: string;
    total_experience: number;
    students_trained_count: number;
    established_year: number;
    total_courses: number;
    phone: string;
    email: string;
    location: string;
    business_hours: string;
    response_time: string;
    service_area: string;
    emergency_availability: string;
    updated_at: string;
}

export interface CompanyValue {
    id: number;
    title: string;
    description: string;
    icon: string;
    display_order: number;
}

export interface WhyChooseUs {
    id: number;
    point: string;
    display_order: number;
    image_url?: string;
    image_alt?: string;
}

export interface CourseCategory {
    id: number;
    name: string;
    description: string;
    display_order: number;
}

export interface Course {
    id: number;
    slug: string;
    title: string;
    description: string;
    duration: string;
    audience: string;
    category_id: number | null;
    popular: boolean;
    image_url?: string;
    image_alt?: string;
    created_at: string;
    updated_at: string;
    category_name?: string;
}

export interface CourseFeature {
    id: number;
    course_id: number;
    feature: string;
    display_order: number;
}

export interface TeamMember {
    id: number;
    name: string;
    role: string;
    bio?: string;
    photo_url?: string;
    experience_years?: number;
    specializations?: string[];
    featured: boolean;
    display_order: number;
    created_at: string;
    updated_at: string;
}

export interface HeroSection {
    id: number;
    slogan: string;
    main_heading: string;
    highlight_text: string;
    subtitle: string;
    background_image_url?: string;
    background_image_alt?: string;
    primary_button_text: string;
    primary_button_link: string;
    secondary_button_text: string;
    secondary_button_link: string;
    updated_at: string;
}

export interface HeroStat {
    id: number;
    number_text: string;
    label: string;
    description?: string;
    display_order: number;
}

export interface HeroFeature {
    id: number;
    title: string;
    description: string;
    display_order: number;
}

export interface AdminUser {
    id: number;
    username: string;
    email: string;
    password_hash: string;
    last_login: string | null;
    created_at: string;
    updated_at: string;
    token_version: number;
}

export interface AdminSession {
    id: number;
    user_id: number;
    token: string;
    expires_at: string;
    created_at: string;
    last_activity: string;
    ip_address: string;
    user_agent: string;
    username?: string;
    email?: string;
    token_version?: number;
}

export interface FooterContent {
    id: number;
    company_name: string;
    tagline: string;
    slogan: string;
    description: string;
    phone: string;
    email: string;
    location: string;
    logo_url?: string;
    logo_alt?: string;
    copyright_text: string;
    tagline_bottom: string;
    updated_at: string;
}

export interface FooterStat {
    id: number;
    number_text: string;
    label: string;
    display_order: number;
}

export interface FooterQuickLink {
    id: number;
    title: string;
    url: string;
    display_order: number;
    is_active: boolean;
}

export interface FooterCertification {
    id: number;
    title: string;
    icon: string;
    display_order: number;
    is_active: boolean;
}

export interface FooterBottomBadge {
    id: number;
    title: string;
    icon: string;
    display_order: number;
    is_active: boolean;
}

export interface File {
    id: number;
    filename: string;
    original_name: string;
    file_size: number;
    mime_type: string;
    file_extension: string;
    blob_url: string;
    blob_pathname: string;
    blob_token: string;
    width?: number;
    height?: number;
    aspect_ratio?: number;
    alt_text?: string;
    title?: string;
    description?: string;
    tags?: string;
    caption?: string;
    folder_id?: number;
    category: string;
    uploaded_by: number;
    usage_count: number;
    status: 'active' | 'archived' | 'deleted';
    is_featured: boolean;
    uploaded_at: string;
    updated_at: string;
    folder_name?: string;
}

export interface FileFolder {
    id: number;
    name: string;
    description?: string;
    parent_id?: number;
    display_order: number;
    created_at: string;
    updated_at: string;
}