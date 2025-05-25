# SkillSync Frontend

A modern React frontend for the SkillSync platform, a marketplace for freelance services.

## Features

- User authentication with JWT
- Service listings and filtering
- Service details with image gallery
- Booking services
- Seller dashboard to manage services
- Cloudinary integration for image uploads
- Responsive design with Tailwind CSS

## Technologies

- React 18
- TypeScript
- React Router 6
- React Query for API data fetching
- Tailwind CSS for styling
- Shadcn UI components
- Cloudinary for image management

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- SkillSync API backend running

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   # API Configuration
   VITE_API_URL=https://localhost:7205/api

   # Cloudinary Configuration (should match backend settings)
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   VITE_CLOUDINARY_API_KEY=your_api_key
   VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
   ```

4. Start the development server:
   ```
   npm run dev
   ```

## Environment Variables

- `VITE_API_URL`: The URL of the SkillSync API
- `VITE_CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
- `VITE_CLOUDINARY_API_KEY`: Your Cloudinary API key
- `VITE_CLOUDINARY_UPLOAD_PRESET`: Your Cloudinary upload preset name

## Backend Integration

This frontend is designed to work with the SkillSync API backend. It communicates with the following main endpoints:

- `/Auth` - User authentication and registration
- `/Services` - Service CRUD operations
- `/Services/images/upload` - Image upload for services
- `/Bookings` - Booking services
- `/User` - User profile management

## Folder Structure

- `src/`: Source code
  - `components/`: Reusable UI components
  - `contexts/`: React contexts including AuthContext
  - `hooks/`: Custom React hooks
  - `pages/`: Page components
  - `services/`: API services and utilities
  - `types/`: TypeScript type definitions
  - `utils/`: Utility functions
  - `assets/`: Static assets like images and icons

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License.
