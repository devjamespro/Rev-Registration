import Meeting from './Meeting';

export default interface Schedule {
  meetings: Meeting[];
  name: string;
  locked: boolean;
}
