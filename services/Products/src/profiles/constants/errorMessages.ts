import { CreateErrors } from '../types/CreateErrors';
import { EditErrors } from '../types/EditErrors';
import { GetByEmailErrors } from '../types/GetByEmailErrors';
import { InitializeProfileErrors } from '../types/InitializeProfileErrors';

export const nameErrorMessages = {
  illegal:
    'Name must start and end with a letter and can only contain letters, spaces, hyphens, or apostrophes.',
};

export const getProfileErrorMessages = {
  doesNotExist: 'The profile you are looking for does not exist',
};

export const getProfileByEmailErrorMessages: Record<GetByEmailErrors, string> =
  {
    [GetByEmailErrors.DoesNotExist]:
      'Profile could not be retrieved, it might have been deleted',
    [GetByEmailErrors.NotConfirmed]: 'You must first confirm your profile.',
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

export const profileInitializationErrors = {
  [InitializeProfileErrors.Unknown]:
    'Something went wrong with profile initialization',
  [InitializeProfileErrors.EmailAlreadyExists]:
    'Profile with this email has already been initialized',
};
