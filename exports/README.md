# Exports Directory

This directory contains exported blueprint files in various formats.

## Structure

```
exports/
├── {projectId}/
│   ├── {slug}-blueprint-{timestamp}.md
│   └── {slug}-blueprint-{timestamp}.json
```

## File Formats

### Markdown (.md)
Human-readable blueprint documentation with all project details including:
- Project overview and idea
- Problem statement and target users
- User roles and permissions
- Features (core, MVP, advanced)
- Non-functional requirements
- Tech stack details
- Architecture and components
- Database schema
- API routes
- Frontend pages
- Test plan
- Deployment plan
- GitHub issues
- IBM Bob build prompt

### JSON (.json)
Machine-readable blueprint data for programmatic access and integration.

## Usage

Exported files are automatically saved here when you use the export API endpoints:

- **Markdown Export:** `GET /api/blueprints/:id/export/markdown`
- **JSON Export:** `GET /api/blueprints/:id/export/json` (future)

## Notes

- Each project gets its own subdirectory identified by `projectId`
- Files include timestamps to track different versions
- Exports are automatically generated and saved on each API call
- This directory is excluded from version control (see `.gitignore`)