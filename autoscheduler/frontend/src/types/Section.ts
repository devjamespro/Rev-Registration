import Instructor from './Instructor';
import Grades from './Grades';

// Instructional methods from the backend, make sure these are synced with Django's Section model
export enum InstructionalMethod {
  F2F = 'Face to Face',
  MIXED_F2F_REMOTE = 'Mixed, F2F and Remote',
  F2F_REMOTE_OPTION = 'F2F or Remote',
  SYNCHRONOUS_VIDEO = 'Synchronous Video/Web Conf',
  REMOTE = 'Remote Only',
  WEB_BASED = 'Web Based',
  INTERNSHIP = 'Internship',
  NONTRADITIONAL = 'Non-traditional',
  STUDY_ABROAD = 'Study abroad',
  NONE = '',
}
// for sorting by instructional method
export const InstructionalMethodIntValues = new Map<InstructionalMethod, number>([
  [InstructionalMethod.F2F, 0],
  [InstructionalMethod.MIXED_F2F_REMOTE, 1],
  [InstructionalMethod.F2F_REMOTE_OPTION, 2],
  [InstructionalMethod.REMOTE, 3],
  [InstructionalMethod.WEB_BASED, 4],
  [InstructionalMethod.INTERNSHIP, 5],
  [InstructionalMethod.NONTRADITIONAL, 6],
  [InstructionalMethod.STUDY_ABROAD, 7],
  [InstructionalMethod.NONE, 8],
]);

export default class Section {
  id: number;
  crn: number;
  subject: string;
  courseNum: string;
  sectionNum: string;
  minCredits: number;
  maxCredits: number | null;
  currentEnrollment: number;
  maxEnrollment: number;
  honors: boolean;
  remote: boolean;
  asynchronous: boolean;
  mcallen: boolean;
  instructor: Instructor;
  grades: Grades;
  instructionalMethod: InstructionalMethod;

  constructor(src: {
      id: number;
      crn: number;
      subject: string;
      courseNum: string;
      sectionNum: string;
      minCredits: number;
      maxCredits: number | null;
      currentEnrollment: number;
      maxEnrollment: number;
      honors: boolean;
      remote: boolean;
      asynchronous: boolean;
      mcallen: boolean;
      instructor: Instructor;
      grades: Grades;
      instructionalMethod: InstructionalMethod;
    }) {
    if (!Number.isInteger(src.id)) { throw Error(`Section.id is invalid: ${src.id}`); }
    if (!Number.isInteger(src.crn)) { throw Error(`Meeting.crn is invalid: ${src.crn}`); }
    if (!src.subject) { throw Error(`Section.subject is invalid: ${src.subject}`); }
    if (!src.courseNum) { throw Error(`Section.courseNum is invalid ${src.courseNum}`); }
    if (!src.sectionNum) { throw Error(`Section.sectionNUm is invalid: ${src.sectionNum}`); }
    if (!Number.isInteger(src.minCredits)) {
      throw Error(`Section.minCredits is invalid: ${src.minCredits}`);
    }
    if (src.maxCredits !== null && !Number.isInteger(src.maxCredits)) {
      throw Error(`Section.maxCredits is invalid: ${src.maxCredits}`);
    }
    if (!Number.isInteger(src.currentEnrollment) || src.currentEnrollment < 0) {
      throw Error(`Section.currentEnrollment is invalid: ${src.currentEnrollment}`);
    }
    if (!Number.isInteger(src.maxEnrollment) || src.maxEnrollment < 0) {
      throw Error(`Section.maxEnrollment is invalid: ${src.maxEnrollment}`);
    }
    if (src.honors == null) {
      throw Error('Section.honors is undefined or null');
    }
    if (src.remote == null) {
      throw Error('Section.remote is undefined or null');
    }
    if (src.asynchronous == null) {
      throw Error('Section.asynchronous is undefined or null');
    }
    if (src.mcallen == null) {
      throw Error('Section.mcallen is undefined or null');
    }
    if (!src.instructor) { throw Error(`Section.instructor is invalid: ${src.instructor}`); }

    Object.assign(this, src);
  }
}
