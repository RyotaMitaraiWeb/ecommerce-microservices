import { CreateProfileDto } from '../dto/create-profile.dto';
import { Profile } from '../entities/profile.entity';

const deletedProfile = new Profile();
deletedProfile.id = 3;
deletedProfile.firstName = 'Nullius';
deletedProfile.lastName = 'Nullified';
deletedProfile.email = 'deleted@gmail.com';
deletedProfile.confirmed = true;
deletedProfile.createdAt = new Date('01/01/2020');
deletedProfile.deletedAt = new Date('02/02/2020');

const unconfirmedProfile = new Profile();
unconfirmedProfile.confirmed = false;
unconfirmedProfile.id = 2;
unconfirmedProfile.createdAt = new Date('01/01/2020');
unconfirmedProfile.email = 'test@email.com';
unconfirmedProfile.firstName = 'john';
unconfirmedProfile.lastName = 'doe';

const profile = new Profile();
profile.id = 1;
profile.confirmed = true;
profile.createdAt = new Date('01/01/2020');
profile.firstName = 'Ryota';
profile.lastName = 'Mitarai';
profile.email = 'ryota@gmail.com';

const createProfileBody = new CreateProfileDto();
createProfileBody.firstName = 'John';
createProfileBody.lastName = 'Doe';

export { profile, deletedProfile, unconfirmedProfile, createProfileBody };
