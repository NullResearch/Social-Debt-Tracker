# Changelog

All notable changes to Social Debt Tracker will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-15

### Added
- Initial release of Social Debt Tracker
- Favor tracking with bidirectional support (you owe / they owe you)
- Person-based organization with balance calculations
- Status tracking (pending/completed)
- 5-star rating system for completed favors
- Comment system for favors
- Search and filter functionality
- Dark/Light theme toggle
- CSV import/export functionality
- Leaderboard showing most frequent interactions
- Local storage persistence
- Responsive design for mobile and desktop
- Due date reminders
- Tag support for favors
- User profile with avatar upload
- Pagination for favor lists
- Loading screen
- Toast notifications
- Tooltips for better UX

### Security
- Input sanitation for all user inputs
- XSS protection with HTML escaping
- Input length limits to prevent abuse
- Client-side validation

### Documentation
- Comprehensive README
- Contributing guidelines
- Code of Conduct
- License file (MIT)
- Security notices and disclaimers
- Privacy statement

## [1.1.0] - 2026-01-16

### Added
- Comprehensive error logging system with automatic error capture
- Settings panel with data management options
- View, export, and clear error logs functionality
- Clear all data, favors only, or profile only options
- Error statistics display (total errors and last 24h)
- Global error handlers for uncaught errors and promise rejections
- Enhanced About section with error logging documentation

### Changed
- Updated version to 1.1.0
- Enhanced security with error context tracking
- Improved user control over stored data

## [Unreleased]

### Planned
- Export to JSON format
- Recurring favors
- Favor categories
- Advanced filtering options
- Data backup reminders
- Keyboard shortcuts