import { CreateErrors } from '../types/CreateErrors';
import { EditErrors } from '../types/EditErrors';

export const nameErrorMessages = {
  illegal:
    'Name must start and end with a letter and can only contain letters, spaces, hyphens, or apostrophes.',
};

export const getProfileErrorMessages = {
  doesNotExist: 'The profile you are looking for does not exist',
};

export const createProfileErrorMessages = {
  [CreateErrors.IsConfirmed]:
    'Your profile is already confirmed. Please use edit functionalities instead',
  [CreateErrors.NoAccountWithSuchId]: 'No profile found.',
};

export const editProfileErrorMessages = {
  [EditErrors.IsNotConfirmed]:
    'Please confirm your account first before making edits to your profile!',
  [EditErrors.NoAccountWithSuchId]: 'No profile found.',
};
