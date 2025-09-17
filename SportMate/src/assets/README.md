# Assets Directory

This directory contains all the static assets used in the application, such as:

- Images
- Icons
- Fonts
- JSON files
- Other static resources

## Structure

- `images/` - Contains all image files
- `icons/` - Contains all icon files
- `fonts/` - Contains all font files

## Usage

Import assets using the path alias:

```typescript
// For images
import myImage from '@assets/images/my-image.png';

// For icons
import myIcon from '@assets/icons/my-icon.svg';

// For fonts
// Usually imported in a global stylesheet
