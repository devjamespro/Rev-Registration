import asyncio
import time
import datetime
from typing import List
from django.core.management import base
from scraper.banner_requests import BannerRequests
from scraper.models import Course, Instructor, Section, Meeting, Department
from scraper.models.course import generate_course_id
from scraper.models.section import generate_meeting_id

def convert_meeting_time(string_time: str):
    """ Converts a meeting time from a string in format hhmm to datetime.
        ex) 1245 = 12:45am. 1830 = 6:30 pm.
    """

    if string_time == "" or string_time is None:
        return None

    hour = int(string_time[0:2])
    minute = int(string_time[2:4])
    meeting_time = datetime.time(hour, minute)

    return meeting_time

def parse_meeting_days(meetings_data):
    """ Generates a list of seven booleans where each corresponds to a day in the week.
        The first is Monday and the last is Sunday. If true, there is class that day
    """
    meeting_class_days = [
        'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    attend_days = [meetings_data['meetingTime'][day] for day in meeting_class_days]

    return attend_days

def parse_section(course_data, instructor_object):
    """ Puts section data in database & calls parse_meeting.
        Called from parse_course.
    """

    #gets values to create object
    section_id = int(course_data['id'])
    section_subject = course_data['subject']
    course_number = course_data['courseNumber']
    section_number = course_data['sequenceNumber']
    section_term_code = course_data['term']

    if len(course_data['meetingsFaculty']) > 0:
        section_crn = course_data['meetingsFaculty'][0]['courseReferenceNumber']
    else:
        section_crn = 0

    section_min_credits = course_data['creditHourLow']
    section_max_credits = course_data['creditHourHigh']
    section_max_enrollment = course_data['maximumEnrollment']
    section_current_enrollment = course_data['enrollment']

    # Creates and saves section object
    section_object = Section(
        id=section_id, subject=section_subject, course_num=course_number,
        section_num=section_number, term_code=section_term_code,
        crn=section_crn, min_credits=section_min_credits,
        max_credits=section_max_credits, max_enrollment=section_max_enrollment,
        current_enrollment=section_current_enrollment, instructor=instructor_object)
    section_object.save()

    # Parse each meeting in this section
    for i, meetings_data in enumerate(course_data['meetingsFaculty']):
        parse_meeting(meetings_data, section_object, i)

def parse_meeting(meetings_data, section_object, meeting_count):
    """ Parses the meeting data and saves it as a Meeting model.
        Called by parse_section on each of the section's meeting times.
    """

    meeting_id = generate_meeting_id(str(section_object.id), str(meeting_count))

    meeting_class_days = parse_meeting_days(meetings_data)

    meeting_start_time = convert_meeting_time(meetings_data['meetingTime']['beginTime'])
    meeting_end_time = convert_meeting_time(meetings_data['meetingTime']['endTime'])

    meeting_building = meetings_data['meetingTime']['building']
    meeting_class_type = meetings_data['meetingTime']['meetingType']

    meeting_object = Meeting(id=meeting_id, building=meeting_building,
                             meeting_days=meeting_class_days,
                             start_time=meeting_start_time, end_time=meeting_end_time,
                             meeting_type=meeting_class_type, section=section_object)
    meeting_object.save()

def parse_instructor(course_data):
    """ Parses the instructor data and saves it as a Instructor model.
        Called from parse_course.
    """

    # Can have multiple instructor entries, although most will have 0-1
    for i in course_data['faculty']:
        instructor_id = i['displayName'] if i['displayName'] else None
        if instructor_id is None:
            return None
        instructor_email = i['emailAddress']

        instructor_object = Instructor(
            id=instructor_id, email_address=instructor_email)

        instructor_object.save()
        return instructor_object

def parse_course(course_data):
    """ Creates Course model and saves it to the databsae.
        Calls parse_instructor and parse_section
    """

    course_dept = course_data['subject']
    course_number = course_data['courseNumber']
    course_term_code = course_data['term']
    # Generate the course's id using the above data
    course_id = generate_course_id(course_dept, course_number, course_term_code)

    course_title = course_data['courseTitle']
    course_credit_hours = course_data['creditHourLow']

    #creates and saves course object
    course_object = Course(
        id=course_id, dept=course_dept, course_num=course_number, title=course_title,
        credit_hours=course_credit_hours, term=course_term_code)
    course_object.save()

    #calls other parse functions
    instructor_object = parse_instructor(course_data)
    parse_section(course_data, instructor_object)

def get_department_names(term_code) -> List[str]:
    """ Queries database for list of all departments """
    return [dept.code for dept in Department.objects.filter(term=term_code)]

class Command(base.BaseCommand):
    """ Gets course information from banner and adds it to the database """

    def add_arguments(self, parser):
        parser.add_argument('--term', type=str, required=False, default="201931")

    def handle(self, *args, **options):
        banner = BannerRequests(options['term'])
        loop = asyncio.get_event_loop()

        depts = get_department_names(options['term'])

        json = loop.run_until_complete(banner.search(depts))

        start = time.time()
        for course_list in json:
            for course in course_list:
                parse_course(course)

        finish = time.time()
        elapsed_time = finish - start
        print(f'Finished scraping in {elapsed_time:.2f} seconds')
