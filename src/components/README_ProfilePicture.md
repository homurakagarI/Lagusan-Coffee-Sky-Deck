# Profile Picture Upload Feature

This feature allows customers to upload and update their profile pictures.

## Implementation Details

The profile picture upload functionality has been implemented with the following components:

1. **UI Components**:
   - Profile avatar display in view mode
   - Upload button and preview in edit mode
   - Progress bar for upload status

2. **Firebase Integration**:
   - Images are stored in Firebase Storage under `profile_images/{userId}/{filename}`
   - Profile document is updated with the image URL after successful upload

3. **Key Functions**:
   - `handleImageChange`: Processes file selection and creates preview
   - `clearProfileImage`: Removes selected image
   - `uploadProfileImage`: Handles file upload to Firebase Storage
   - `updateProfileWithPhoto`: Updates user profile with image URL

## How to Use

1. Navigate to your profile page
2. Click the "Edit" button to enter edit mode
3. Click "Choose File" to select an image
4. A preview of the selected image will be displayed
5. Click "Clear" to remove the selected image if needed
6. Click "Save" to upload the image and update your profile

## Testing

To test the profile picture functionality:

1. Log in as a customer
2. Go to your profile
3. Edit your profile and upload a new image
4. Verify that the image appears in your profile after saving
5. Edit again and try uploading a different image
6. Verify that the image is updated

## Troubleshooting

If you encounter issues:

1. Check browser console for errors
2. Verify that Firebase Storage rules allow write access
3. Ensure the image file size is reasonable (under 5MB recommended)
4. Check network requests to confirm upload attempts
