import untypedInstructorIndex from "@/app/generated/instructor-index.json";
import { BaseCourseRow, CourseRow } from "@/app/types";
import { NextResponse } from "next/server";

type InstructorIndex = {
  [instructorName: string]: CourseRow[];
};

const instructorIndex = untypedInstructorIndex as InstructorIndex;

type CoursesByInstructor = {
  [instructor: string]: {
    [subjectArea: string]: {
      [catalogNumber: string]: BaseCourseRow & {
        nRows: number;
      };
    };
  };
};

// Static export support
export const dynamic = "force-static";

export async function GET() {
  const coursesByInstructor: CoursesByInstructor = {};
  const instructors = Object.keys(instructorIndex);

  for (const instructor of instructors) {
    if (!coursesByInstructor[instructor]) {
      coursesByInstructor[instructor] = {};
    }

    for (const course of instructorIndex[instructor]) {
      const { subjectArea } = course;
      if (!coursesByInstructor[instructor][subjectArea]) {
        coursesByInstructor[instructor][subjectArea] = {};
      }

      if (!coursesByInstructor[instructor][subjectArea][course.catalogNumber]) {
        coursesByInstructor[instructor][subjectArea][course.catalogNumber] = {
          subjectArea,
          courseTitle: course.courseTitle,
          catalogNumber: course.catalogNumber,
          nRows: 1,
        };
      } else {
        coursesByInstructor[instructor][subjectArea][
          course.catalogNumber
        ].nRows += 1;
      }
    }
  }

  return NextResponse.json(coursesByInstructor);
}

export type Response = CoursesByInstructor;
